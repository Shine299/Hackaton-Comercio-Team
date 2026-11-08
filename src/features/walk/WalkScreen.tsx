import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Share, View } from 'react-native';

import { useSectorStore } from '@/features/sector';
import { Button, Card, Chip, DemoTag, Icon, Screen, Text } from '@/shared/ui';

import { cancelArrivalCheck, scheduleArrivalCheck } from './notify';
import { useWalkStore } from './store';
import { formatCountdown, walkState } from './timer';

/** Vecinos de confianza de demostración (todavía no hay contactos de confianza reales en el perfil). */
const DEMO_GUARDIANS = [
  { id: 'r', name: 'Rosa M.', detail: 'Vecina · cuadra 4' },
  { id: 'j', name: 'Julio P.', detail: 'Vecino · cuadra 3' },
  { id: 'c', name: 'Carmen L.', detail: 'Vecina · cuadra 5' },
];
const TIMES = [10, 15, 30];

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

const timeLabel = (ms: number) => {
  const d = new Date(ms);
  const h = d.getHours();
  return `${h % 12 === 0 ? 12 : h % 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`;
};

const joinNames = (names: string[]) => (names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`);

/**
 * «Acompáñame»: eliges vecinos de confianza y un tiempo. Si no marcas «Llegué bien» a tiempo, la app te
 * pregunta y te deja avisarles con un toque. Sin ubicación en vivo: solo el sector.
 */
export function WalkScreen() {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const session = useWalkStore((s) => s.session);
  const start = useWalkStore((s) => s.start);
  const arrive = useWalkStore((s) => s.arrive);
  const clear = useWalkStore((s) => s.clear);
  const [chosen, setChosen] = useState<string[]>(['r', 'j']);
  const [minutes, setMinutes] = useState(15);

  const state = session ? walkState(session, 0) : null;
  const now = useNow(Boolean(session) && state?.phase !== 'arrived');
  const live = session ? walkState(session, now) : null;

  const begin = async () => {
    const guardians = DEMO_GUARDIANS.filter((g) => chosen.includes(g.id)).map((g) => g.name);
    const notificationId = await scheduleArrivalCheck(minutes * 60);
    start({ id: Crypto.randomUUID(), guardians, minutes, startedAt: Date.now(), arrivedAt: null, notificationId });
  };

  const arrived = () => {
    void cancelArrivalCheck(session?.notificationId);
    arrive();
  };

  const finish = () => {
    void cancelArrivalCheck(session?.notificationId);
    clear();
  };

  const alertNeighbors = () => {
    if (!session) return;
    void Share.share({
      message: `Hola, soy tu vecino/a de ${sector.name}. Iba camino a casa y todavía no marco que llegué bien. ¿Me puedes llamar o escribir? (Aviso enviado desde Yunta)`,
    });
  };

  // 1) Elegir vecinos y tiempo
  if (!session || !live) {
    const canStart = chosen.length > 0;
    return (
      <Screen
        noTopInset
        safeBottom
        contentClassName="gap-4 px-5 pb-6 pt-4"
        footer={<Button label="Empezar trayecto" size="lg" icon="walk" disabled={!canStart} onPress={() => void begin()} />}>
        <Text tone="muted">Si no marcas «Llegué bien» a tiempo, te preguntamos y puedes avisar a tus vecinos con un toque.</Text>

        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <Text variant="body-lg-bold" className="flex-1">
              ¿Quién te acompaña? (hasta 3)
            </Text>
            <DemoTag />
          </View>
          {DEMO_GUARDIANS.map((g) => {
            const on = chosen.includes(g.id);
            return (
              <Pressable
                key={g.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={`${g.name}, ${g.detail}`}
                onPress={() => setChosen((c) => (on ? c.filter((x) => x !== g.id) : [...c, g.id]))}
                className={`min-h-16 flex-row items-center gap-3 rounded-2xl bg-surface-container-lowest px-3 py-2 active:opacity-90 ${on ? 'border-[3px] border-primary' : 'border-2 border-outline-variant'}`}>
                <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-fixed">
                  <Text variant="body-lg-bold" tone="primary">
                    {g.name.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text variant="body-lg-bold">{g.name}</Text>
                  <Text variant="label-md" tone="muted">
                    {g.detail}
                  </Text>
                </View>
                <Icon name={on ? 'check-circle' : 'checkbox-blank-circle-outline'} size={28} color="primary" />
              </Pressable>
            );
          })}
        </View>

        <View className="gap-2" accessibilityRole="radiogroup" accessibilityLabel="¿Cuánto tardas en llegar?">
          <Text variant="body-lg-bold">¿Cuánto tardas en llegar?</Text>
          <View className="flex-row flex-wrap gap-2">
            {TIMES.map((m) => (
              <Chip key={m} role="radio" label={`${m} min`} selected={minutes === m} onPress={() => setMinutes(m)} />
            ))}
          </View>
        </View>

        <Card tone="low" className="flex-row items-start gap-2.5">
          <Icon name="lock-outline" size={20} color="primary" />
          <Text variant="body-md" tone="muted" className="flex-1">
            No compartimos tu ubicación exacta. Tus vecinos solo sabrían tu sector ({sector.name}) y la hora a la que deberías llegar.
          </Text>
        </Card>
      </Screen>
    );
  }

  // 3) Llegó
  if (live.phase === 'arrived') {
    return (
      <Screen noTopInset safeBottom footer={<Button label="Listo" size="lg" onPress={() => { finish(); router.back(); }} />}>
        <View className="flex-1 items-center justify-center gap-3 px-4 py-12" accessibilityLiveRegion="polite">
          <View className="h-28 w-28 items-center justify-center rounded-full bg-success-container">
            <Icon name="home-heart" size={60} color="success" />
          </View>
          <Text variant="headline-lg" className="text-center">
            ¡Qué bueno que llegaste!
          </Text>
          <Text tone="muted" className="text-center">
            El trayecto terminó. Si avisaste a {joinNames(session.guardians)}, cuéntales que ya estás en casa.
          </Text>
        </View>
      </Screen>
    );
  }

  // 2) En camino o vencido
  const overdue = live.phase === 'overdue';
  return (
    <Screen noTopInset safeBottom contentClassName="gap-4 px-5 pb-6 pt-6">
      <View className="items-center gap-2" accessibilityLiveRegion="polite">
        {overdue ? (
          <View className="flex-row items-center gap-1.5 rounded-full bg-warning-container px-3 py-1.5">
            <Icon name="clock-alert-outline" size={18} color="warning" />
            <Text variant="label-md" tone="warning">
              Se cumplió tu tiempo
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-1.5 rounded-full bg-primary-fixed px-3 py-1.5">
            <Icon name="walk" size={18} color="primary" />
            <Text variant="label-md" tone="primary">
              En camino
            </Text>
          </View>
        )}
        <Text
          accessibilityRole="timer"
          accessibilityLabel={overdue ? 'Tiempo cumplido' : `Quedan ${formatCountdown(live.remainingMs).replace(':', ' minutos y ')} segundos`}
          style={{ fontSize: 72, lineHeight: 80, fontVariant: ['tabular-nums'] }}
          className="font-inter-bold">
          {formatCountdown(live.remainingMs)}
        </Text>
        <Text tone="muted">Llegada prevista: {timeLabel(live.dueAt)}</Text>
      </View>

      <Card>
        <Text variant="label-md" tone="muted">
          Te acompañan
        </Text>
        <Text variant="body-lg-bold">{joinNames(session.guardians)}</Text>
      </Card>

      {overdue ? (
        <Card tone="warning" className="gap-3">
          <Text variant="body-lg-bold">¿Estás bien?</Text>
          <Text>Si todo está bien, marca «Llegué bien». Si no, avisa a tus vecinos o pide ayuda.</Text>
          <Button label="Avisar a mis vecinos" variant="outline" icon="share-variant" onPress={alertNeighbors} />
        </Card>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Llegué bien"
        onPress={arrived}
        className="min-h-[88px] flex-row items-center justify-center gap-3 rounded-3xl bg-success active:opacity-90">
        <Icon name="home" size={34} color="onPrimary" />
        <Text variant="headline-md" tone="onPrimary">
          Llegué bien
        </Text>
      </Pressable>
      <Button label="Necesito ayuda ahora" variant="outline" icon="alarm-light-outline" onPress={() => router.push('/emergencias/necesito-ayuda')} />
      <Button label="Cancelar trayecto" variant="ghost" onPress={finish} />
      <Text variant="label-md" tone="muted" className="text-center">
        Yunta no reemplaza al 105 ni al serenazgo.
      </Text>
    </Screen>
  );
}
