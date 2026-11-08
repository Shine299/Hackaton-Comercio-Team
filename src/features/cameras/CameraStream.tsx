import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Icon, Text } from '@/shared/ui';

import { snapshotUrl } from './streamUrl';
import type { Camera } from './types';

type Status = 'connecting' | 'live' | 'offline';

/** Pausa entre fotos con señal (≈ 1,5 cuadros por segundo) y antes de reintentar sin señal. */
const FRAME_GAP_MS = 600;
const RETRY_MS = 3000;

const STATUS_PILL: Record<Status, { label: string; dot: string; text: string }> = {
  connecting: { label: 'Conectando…', dot: '#8a5300', text: '#8a5300' },
  live: { label: 'En vivo', dot: '#1b6b3a', text: '#1b6b3a' },
  offline: { label: 'Sin señal', dot: '#8a5300', text: '#8a5300' },
};

function StatusPill({ status }: { status: Status }) {
  const s = STATUS_PILL[status];
  return (
    <View className="absolute left-3 top-3 flex-row items-center gap-1.5 rounded-full bg-white px-3 py-1.5">
      {status === 'offline' ? (
        <Icon name="cctv-off" size={15} color="warning" />
      ) : (
        <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: s.dot }} />
      )}
      <Text variant="label-md" style={{ color: s.text }}>
        {s.label}
      </Text>
    </View>
  );
}

/** Calle dibujada para las cámaras de demostración (no hay video real). */
function DemoStreet({ active }: { active: boolean }) {
  return (
    <View className="flex-1" style={{ backgroundColor: '#1d2a2a' }}>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '38%', backgroundColor: '#2c3a3a' }} />
      <View style={{ position: 'absolute', left: '10%', bottom: '38%', width: '18%', height: '40%', backgroundColor: '#3a4a4a', borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
      <View style={{ position: 'absolute', left: '32%', bottom: '38%', width: '24%', height: '50%', backgroundColor: '#344444', borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
      <View style={{ position: 'absolute', right: '9%', bottom: '38%', width: '22%', height: '34%', backgroundColor: '#3a4a4a', borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: '17%', height: 4, flexDirection: 'row', gap: 24, paddingLeft: 8 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <View key={i} style={{ width: 28, height: 4, backgroundColor: '#8a9a9a' }} />
        ))}
      </View>
      {!active ? <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' }} /> : null}
      <View className="absolute bottom-3 right-3 rounded-full px-3 py-1.5" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <Text variant="label-md" tone="onPrimary">
          Vista de demostración
        </Text>
      </View>
    </View>
  );
}

/**
 * Video «casi en vivo» sin dependencias nuevas: pide la foto `/shot.jpg` de IP Webcam una tras otra y la
 * muestra solo cuando terminó de cargar (doble búfer, sin parpadeo). Se detiene al salir de la pantalla.
 */
function LiveSnapshot({ host, onStatus }: { host: string; onStatus: (s: Status) => void }) {
  const [shown, setShown] = useState<string | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const focused = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const schedule = useCallback(
    (delay: number) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (focused.current) setNext(snapshotUrl(host, Date.now()));
      }, delay);
    },
    [host],
  );

  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      setNext(snapshotUrl(host, Date.now()));
      return () => {
        focused.current = false;
        clearTimeout(timer.current);
      };
    }, [host]),
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <View className="flex-1" style={{ backgroundColor: '#1d2a2a' }}>
      {shown ? (
        <Image source={{ uri: shown }} style={{ flex: 1 }} contentFit="cover" cachePolicy="memory" transition={0} accessibilityIgnoresInvertColors />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Icon name="cctv" size={56} color="outline" />
        </View>
      )}
      {next ? (
        <Image
          key={next}
          source={{ uri: next }}
          cachePolicy="memory"
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
          onLoad={() => {
            setShown(next);
            onStatus('live');
            schedule(FRAME_GAP_MS);
          }}
          onError={() => {
            onStatus('offline');
            schedule(RETRY_MS);
          }}
        />
      ) : null}
    </View>
  );
}

/** Visor de una cámara vecinal: video (o vista demo) con su estado en texto + color. */
export function CameraStream({ camera, height = 236 }: { camera: Camera; height?: number }) {
  const [status, setStatus] = useState<Status>(camera.host ? 'connecting' : camera.active ? 'live' : 'offline');

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${camera.name}, ${camera.placeLabel}. ${STATUS_PILL[status].label}${camera.isDemo ? '. Vista de demostración' : ''}`}
      className="overflow-hidden rounded-3xl"
      style={{ height }}>
      {camera.host ? <LiveSnapshot host={camera.host} onStatus={setStatus} /> : <DemoStreet active={camera.active} />}
      <StatusPill status={status} />
    </View>
  );
}

export type { Status as CameraStatus };
