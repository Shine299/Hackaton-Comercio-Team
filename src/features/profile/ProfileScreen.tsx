import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useRegistrationGate, useSessionStore } from '@/features/session';
import { Button, Card, Screen, SegmentedControl, Text } from '@/shared/ui';

import { ProfileHome } from './ProfileHome';
import { ProfileSaved } from './ProfileSaved';
import { ProfileSettings } from './ProfileSettings';

type ProfileTab = 'profile' | 'saved' | 'settings';

/** Perfil público, guardados en colecciones y ajustes de privacidad. */
export function ProfileScreen() {
  const router = useRouter();
  const registered = useSessionStore((s) => s.registered);
  const { requireRegistration, sheet } = useRegistrationGate();
  const [tab, setTab] = useState<ProfileTab>('profile');

  if (!registered) {
    return (
      <Screen noTopInset>
        <Text variant="headline-lg">Tu perfil vecinal</Text>
        <Text tone="muted">
          Puedes explorar sin cuenta. El perfil pide solo un nombre público para publicar, contactar y guardar.
        </Text>
        <Card>
          <Text variant="headline-sm">Qué incluye</Text>
          <Text>Nombre y frase pública, con el sector aproximado si tú lo dejas visible.</Text>
          <Text>Confianza progresiva: empiezas como nueva en la red. Verificar identidad llega con el servidor.</Text>
          <Text>Colecciones de guardados y disponibilidad voluntaria, sin asignación automática.</Text>
        </Card>
        <Button
          label="Crear mi perfil"
          size="lg"
          icon="account-plus-outline"
          onPress={() =>
            requireRegistration('Para tener un perfil público, crea tu cuenta vecinal.', () => undefined)
          }
        />
        <Button
          label="Ver el tutorial de nuevo"
          variant="outline"
          icon="school-outline"
          onPress={() => router.push('/onboarding')}
        />
        {sheet}
      </Screen>
    );
  }

  return (
    <Screen noTopInset>
      <SegmentedControl
        accessibilityLabel="Secciones del perfil"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'profile', label: 'Perfil', icon: 'account-outline' },
          { value: 'saved', label: 'Guardados', icon: 'bookmark-outline' },
          { value: 'settings', label: 'Ajustes', icon: 'cog-outline' },
        ]}
      />
      {tab === 'profile' ? <ProfileHome /> : null}
      {tab === 'saved' ? <ProfileSaved /> : null}
      {tab === 'settings' ? <ProfileSettings /> : null}
    </Screen>
  );
}
