import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
} from 'expo-audio';
import { useState } from 'react';
import { View } from 'react-native';

import { useMicStore } from '@/shared/nav/micStore';
import { Button, Card, Text } from '@/shared/ui';

import { levelToUnit, pushLevel } from './levels';
import { transcribeAudio } from './repository';
import { type ClipOutcome, clipSummary, micTestAdvice } from './voice';
import { VoiceTrail } from './VoiceTrail';

const PRESET = { ...RecordingPresets.HIGH_QUALITY, sampleRate: 16_000, numberOfChannels: 1, bitRate: 32_000, isMeteringEnabled: true };
const TEST_MS = 4000;
const STEP_MS = 150;
const MIC_OWNER = 'prueba-microfono';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

type Report = { seconds: number; kb: number; peakDb: number | null; heard: string | null; outcome: ClipOutcome };

/**
 * «¿No te oye? Prueba tu micrófono» (SPEC-053). Graba 4 segundos con la estela de audio, te deja ESCUCHAR lo grabado y dice
 * qué entendió el servidor. Separa los tres sospechosos: el teléfono no graba, graba sin tu voz, o el servidor no entiende.
 * El audio no se guarda: se envía a transcribir como cualquier pregunta por voz y se descarta.
 */
export function MicTest() {
  const recorder = useAudioRecorder(PRESET);
  const [phase, setPhase] = useState<'idle' | 'recording' | 'sending'>('idle');
  const [levels, setLevels] = useState<number[]>([]);
  const [uri, setUri] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const player = useAudioPlayer(uri);

  const run = async () => {
    if (phase !== 'idle') return;
    setError(null);
    setReport(null);
    setUri(null);
    setLevels([]);
    // La guardia y la conversación sueltan el micrófono mientras dura la prueba.
    useMicStore.getState().hold(MIC_OWNER);
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError('Sin permiso de micrófono. Actívalo para Expo Go en los ajustes del teléfono.');
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setPhase('recording');

      let peak = Number.NEGATIVE_INFINITY;
      const startedAt = Date.now();
      while (Date.now() - startedAt < TEST_MS) {
        await sleep(STEP_MS);
        const level = recorder.getStatus().metering;
        if (typeof level === 'number' && level > peak) peak = level;
        setLevels((prev) => pushLevel(prev, levelToUnit(level)));
      }
      const status = recorder.getStatus();
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

      const fileUri = recorder.uri;
      setUri(fileUri);
      setPhase('sending');
      const base = {
        seconds: Math.round(status.durationMillis / 1000),
        kb: Math.round((status.fileSize ?? 0) / 1024),
        peakDb: Number.isFinite(peak) ? peak : null,
      };
      if (!fileUri) {
        setReport({ ...base, heard: null, outcome: 'format' });
        return;
      }
      try {
        const result = await transcribeAudio(fileUri);
        setReport(
          result.text === null
            ? { ...base, heard: null, outcome: result.reason }
            : { ...base, heard: result.text, outcome: 'ok' },
        );
      } catch {
        setReport({ ...base, heard: null, outcome: 'offline' });
      }
    } catch (e) {
      setError(e instanceof Error ? `No se pudo grabar: ${e.message}` : 'No se pudo grabar.');
    } finally {
      useMicStore.getState().release(MIC_OWNER);
      setPhase('idle');
    }
  };

  const playBack = async () => {
    if (!uri) return;
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    await player.seekTo(0);
    player.play();
  };

  return (
    <Card tone="low" className="gap-3">
      <Text variant="body-lg-bold">¿No te oye? Prueba tu micrófono</Text>
      <Text variant="label-md" tone="muted">
        Graba 4 segundos, te deja escuchar lo grabado y dice qué entendió el servidor. Di, por ejemplo: «Hola Yunta, ¿qué hay hoy?».
      </Text>

      {phase === 'recording' ? <VoiceTrail levels={levels} mode="listening" /> : null}
      {phase === 'sending' ? (
        <Text variant="body-md-medium" accessibilityLiveRegion="polite">
          Enviando a transcribir…
        </Text>
      ) : null}

      {report ? (
        <View className="gap-1.5" accessibilityLiveRegion="polite">
          <Text variant="body-md-medium">{clipSummary(report).replace('Último audio', 'Se grabó')}</Text>
          <Text variant="body-md">Tamaño del archivo: {report.kb} KB</Text>
          <Text variant="body-md">El servidor entendió: {report.heard ? `«${report.heard}»` : 'nada'}</Text>
          <Text variant="body-md-medium" tone={report.outcome === 'ok' ? 'primary' : 'error'}>
            {micTestAdvice(report)}
          </Text>
        </View>
      ) : null}
      {error ? (
        <Text variant="body-md-medium" tone="error" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Button
        label={phase === 'recording' ? 'Grabando… habla ahora' : phase === 'sending' ? 'Enviando…' : 'Probar micrófono (4 s)'}
        icon="microphone-outline"
        variant="tonal"
        disabled={phase !== 'idle'}
        onPress={() => void run()}
      />
      {uri && phase === 'idle' ? (
        <Button label="Escuchar lo que grabé" icon="play-circle-outline" variant="outline" onPress={() => void playBack()} />
      ) : null}
    </Card>
  );
}
