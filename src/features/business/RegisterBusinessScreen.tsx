import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { usePickPhoto } from '@/shared/hooks/usePickPhoto';
import { useOutboxStore } from '@/features/outbox';
import { useLocalPostsStore, type Post, type PostDetail } from '@/features/posts';
import { useSectorStore } from '@/features/sector';
import { useRegistrationGate, useSessionStore } from '@/features/session';
import { Button, Card, Chip, Icon, PhotoField, Screen, Text, TextField } from '@/shared/ui';

import {
  BUSINESS_RUBROS,
  DELIVERY_HOME,
  DELIVERY_PICKUP,
  DETAIL_DELIVERY,
  DETAIL_HOURS,
  DETAIL_RUBRO,
  type RubroId,
} from './rubros';

const DAY = 24 * 60 * 60 * 1000;

/**
 * Registrar mi emprendimiento: una sola pantalla. Se guarda primero en el teléfono («Guardado en tu
 * teléfono») y se envía por la cola cuando hay conexión. Solo se publica el sector, nunca la dirección.
 */
export function RegisterBusinessScreen() {
  const router = useRouter();
  const { requireRegistration, sheet } = useRegistrationGate();
  const sector = useSectorStore((s) => s.sector);
  const displayName = useSessionStore((s) => s.displayName);
  const deviceId = useSessionStore((s) => s.deviceId);
  const addPost = useLocalPostsStore((s) => s.add);
  const enqueue = useOutboxStore((s) => s.enqueue);
  const photo = usePickPhoto();

  const [name, setName] = useState('');
  const [rubro, setRubro] = useState<RubroId>('bodega');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [pickup, setPickup] = useState(true);
  const [homeDelivery, setHomeDelivery] = useState(false);
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | undefined>();

  const publish = () => {
    if (name.trim().length < 3) {
      setError('Escribe el nombre de tu negocio (al menos 3 letras). Ejemplo: «Bodega Doña Luz».');
      return;
    }
    if (description.trim().length < 10) {
      setError('Cuenta en pocas palabras qué ofreces (al menos 10 letras).');
      return;
    }
    setError(undefined);

    requireRegistration(
      'Para registrar tu emprendimiento, crea tu cuenta vecinal. Solo pedimos un nombre público.',
      () => {
        const rubroInfo = BUSINESS_RUBROS.find((r) => r.id === rubro) ?? BUSINESS_RUBROS[0];
        const delivery = [pickup ? DELIVERY_PICKUP : '', homeDelivery ? DELIVERY_HOME : ''].filter(Boolean).join(' y ');
        const details: PostDetail[] = [{ label: DETAIL_RUBRO, value: rubroInfo.label }];
        if (hours.trim()) details.push({ label: DETAIL_HOURS, value: hours.trim() });
        if (delivery) details.push({ label: DETAIL_DELIVERY, value: delivery });

        const now = Date.now();
        const post: Post = {
          id: Crypto.randomUUID(),
          kind: 'offer',
          category: 'business',
          title: name.trim(),
          description: description.trim(),
          author: { id: deviceId, displayName, trust: 'new', recommendations: 0 },
          sectorId: sector.id,
          distanceM: 0,
          createdAt: now,
          expiresAt: now + 30 * DAY,
          status: 'active',
          priceLabel: price.trim() || undefined,
          urgent: false,
          availableNow: true,
          details,
          photoUri: photo.photoUri,
          isOwn: true,
          syncStatus: 'local',
          isDemo: false,
        };
        addPost(post);
        enqueue('post.create', { postId: post.id }, 'normal');
        router.replace({ pathname: '/publicacion/[id]', params: { id: post.id } });
      },
    );
  };

  return (
    <Screen
      noTopInset
      contentClassName="gap-4"
      footer={<Button label="Publicar emprendimiento" size="lg" icon="storefront-outline" onPress={publish} />}>
      <View className="gap-1">
        <Text variant="headline-lg" accessibilityRole="header">
          Registra tu emprendimiento
        </Text>
        <Text tone="muted">Es gratis. Aparecerá en Negocios de tu sector.</Text>
      </View>

      <TextField
        label="Nombre del negocio"
        placeholder="Ej.: Bodega Doña Luz"
        value={name}
        onChangeText={setName}
      />

      <View className="gap-1.5">
        <Text variant="label-md" tone="muted">
          Rubro
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {BUSINESS_RUBROS.map((r) => (
            <Chip key={r.id} role="radio" label={r.label} icon={r.icon} selected={rubro === r.id} onPress={() => setRubro(r.id)} />
          ))}
        </View>
      </View>

      <TextField
        label="¿Qué ofreces?"
        placeholder="Cuenta en pocas palabras qué vendes o qué servicio das"
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={500}
      />

      <TextField
        label="Horario de atención (opcional)"
        placeholder="Ej.: Lun a sáb, 8 a. m. a 7 p. m."
        value={hours}
        onChangeText={setHours}
      />

      <View className="gap-1.5">
        <Text variant="label-md" tone="muted">
          Cómo entregas
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <Chip label={DELIVERY_PICKUP} icon="store-outline" selected={pickup} onPress={() => setPickup((v) => !v)} />
          <Chip label={DELIVERY_HOME} icon="moped-outline" selected={homeDelivery} onPress={() => setHomeDelivery((v) => !v)} />
        </View>
      </View>

      <TextField
        label="Precio o condición (opcional)"
        placeholder="Ej.: Delivery gratis desde S/ 30"
        value={price}
        onChangeText={setPrice}
      />

      <PhotoField photoUri={photo.photoUri} hint={photo.hint} onPick={() => void photo.pick()} onClear={photo.clear} />

      <Card tone="low" className="flex-row items-start gap-2">
        <Icon name="shield-lock-outline" size={20} color="primary" />
        <Text variant="label-md" tone="muted" className="flex-1">
          Solo mostramos tu sector, nunca tu dirección exacta. Los clientes te escriben con una solicitud y tú
          decides si aceptas.
        </Text>
      </Card>

      {error ? (
        <Text variant="label-md" tone="error" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
      {sheet}
    </Screen>
  );
}
