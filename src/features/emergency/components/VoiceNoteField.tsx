import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useMicStore } from '@/shared/nav/micStore';
import { Button, Card, Text } from '@/shared/ui';

/** Mientras graba, el Modo guardia se aparta del micrófono (SPEC-052). */
const MIC_OWNER = 'nota-de-voz';

type Props = {
  /** Ruta local de la nota ya grabada, si existe. */
  uri?: string;
  onChange: (uri: string | undefined) => void;
};

/**
 * Nota de voz REAL (graba con el micrófono, se puede escuchar y borrar). Se guarda solo en el
 * teléfono: no se sube ni se envía a nadie. Útil cuando escribir es difícil.
 */
export function VoiceNoteField({ uri, onChange }: Props) {
  // `directory: 'document'` evita que el sistema borre la grabación de la caché.
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, directory: 'document' });
  const recorderState = useAudioRecorderState(recorder);
  const player = useAudioPlayer(uri ?? null);
  const playerStatus = useAudioPlayerStatus(player);
  const [error, setError] = useState<string | undefined>();

  // Si se sale de la pantalla grabando, se suelta el micrófono.
  useEffect(() => () => useMicStore.getState().release(MIC_OWNER), []);

  const start = async () => {
    setError(undefined);
    // Avisa antes de grabar: así el Modo guardia suelta el micrófono primero.
    useMicStore.getState().hold(MIC_OWNER);
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        useMicStore.getState().release(MIC_OWNER);
        setError('Sin permiso de micrófono no se puede grabar. Puedes escribir el detalle o activarlo en Ajustes.');
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      useMicStore.getState().release(MIC_OWNER);
      setError('No se pudo empezar a grabar. Inténtalo de nuevo o escribe el detalle.');
    }
  };

  const stop = async () => {
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      if (recorder.uri) onChange(recorder.uri);
    } catch {
      setError('No se pudo guardar la grabación. Inténtalo de nuevo.');
    } finally {
      useMicStore.getState().release(MIC_OWNER);
    }
  };

  const play = () => {
    if (!uri) return;
    if (playerStatus.playing) {
      player.pause();
      return;
    }
    // Si ya terminó, vuelve al inicio.
    if (playerStatus.didJustFinish || playerStatus.currentTime >= playerStatus.duration - 0.1) {
      void player.seekTo(0);
    }
    player.play();
  };

  if (recorderState.isRecording) {
    return (
      <Card tone="error" accessibilityLiveRegion="polite">
        <Text variant="body-lg-bold">Grabando…</Text>
        <Text>Habla con calma. Toca «Detener» cuando termines.</Text>
        <Button label="Detener grabación" variant="danger" icon="stop-circle-outline" onPress={() => void stop()} />
      </Card>
    );
  }

  return (
    <View className="gap-2">
      {uri ? (
        <Card tone="low">
          <Text variant="body-md-medium">Nota de voz guardada</Text>
          <Text variant="label-md" tone="muted">
            Se queda en tu teléfono. No se envía a nadie.
          </Text>
          <View className="flex-row gap-2">
            <Button
              label={playerStatus.playing ? 'Pausar' : 'Escuchar'}
              icon={playerStatus.playing ? 'pause' : 'play'}
              variant="tonal"
              className="flex-1"
              onPress={play}
            />
            <Button
              label="Borrar"
              icon="trash-can-outline"
              variant="outline"
              className="flex-1"
              onPress={() => {
                player.pause();
                onChange(undefined);
              }}
            />
          </View>
        </Card>
      ) : (
        <Button label="Grabar nota de voz" variant="outline" icon="microphone-outline" onPress={() => void start()} />
      )}
      {error ? (
        <Text variant="label-md" tone="error" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
