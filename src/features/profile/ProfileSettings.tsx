import { useRouter } from 'expo-router';
import { useState } from 'react';
import { z } from 'zod';

import { SyncQueueCard } from '@/features/outbox';
import { useSavedStore } from '@/features/posts';
import { useSessionStore } from '@/features/session';
import { Button, Card, Chip, Text, TextField, ViewModePicker } from '@/shared/ui';

import { useProfilePrefsStore, VOLUNTEER_SKILLS } from './store';

const nameSchema = z
  .string()
  .trim()
  .min(2, 'Escribe al menos 2 letras, por ejemplo: «Ana R.»')
  .max(30, 'Usa máximo 30 caracteres.');

/** Privacidad, nombre público, voluntariado y sesión de este teléfono. */
export function ProfileSettings({ part }: { part?: 'privacy' | 'account' }) {
  const router = useRouter();
  const displayName = useSessionStore((s) => s.displayName);
  const updateDisplayName = useSessionStore((s) => s.updateDisplayName);
  const signOut = useSessionStore((s) => s.signOut);
  const bio = useProfilePrefsStore((s) => s.bio);
  const setBio = useProfilePrefsStore((s) => s.setBio);
  const showSector = useProfilePrefsStore((s) => s.showSector);
  const setShowSector = useProfilePrefsStore((s) => s.setShowSector);
  const showRecommendations = useProfilePrefsStore((s) => s.showRecommendations);
  const setShowRecommendations = useProfilePrefsStore((s) => s.setShowRecommendations);
  const volunteerAvailable = useProfilePrefsStore((s) => s.volunteerAvailable);
  const setVolunteerAvailable = useProfilePrefsStore((s) => s.setVolunteerAvailable);
  const skills = useProfilePrefsStore((s) => s.skills);
  const toggleSkill = useProfilePrefsStore((s) => s.toggleSkill);
  const notifyOnChange = useSavedStore((s) => s.notifyOnChange);
  const setNotifyOnChange = useSavedStore((s) => s.setNotifyOnChange);
  const [name, setName] = useState(displayName);
  const [nameError, setNameError] = useState<string | undefined>();
  const [nameHint, setNameHint] = useState<string | undefined>();
  const [confirmOut, setConfirmOut] = useState(false);

  const saveName = () => {
    const parsed = nameSchema.safeParse(name);
    if (!parsed.success) {
      setNameHint(undefined);
      setNameError(parsed.error.issues[0]?.message);
      return;
    }
    updateDisplayName(parsed.data);
    setName(parsed.data);
    setNameError(undefined);
    setNameHint('Nombre actualizado en este teléfono. No se envió a ningún servidor.');
  };

  return (
    <>
      {part !== 'privacy' ? (
        <>
        <Card>
          <Text variant="headline-sm">Cómo ver la app</Text>
          <ViewModePicker />
        </Card>
        <TextField
          label="Nombre público"
          hint={nameHint ?? 'Nombre y la inicial del apellido. Sin teléfono ni correo.'}
          value={name}
          onChangeText={setName}
          error={nameError}
          autoCapitalize="words"
          maxLength={30}
        />
        <Button label="Guardar nombre" variant="tonal" icon="check" onPress={saveName} />

        <TextField
          label="Frase pública (opcional)"
          hint="Máximo 140 caracteres. No pongas dirección ni datos de salud."
          value={bio}
          onChangeText={setBio}
          multiline
          maxLength={140}
        />
        </>
      ) : null}
      {part !== 'account' ? (
        <>
        <Card>
          <Text variant="headline-sm">Privacidad</Text>
          <Text tone="muted">
            Tu ubicación exacta no se guarda. El sector, si lo muestras, es solo el nombre del barrio.
          </Text>
          <Chip
            label="Mostrar mi sector aproximado"
            selected={showSector}
            onPress={() => setShowSector(!showSector)}
          />
          <Chip
            label="Mostrar recomendaciones"
            selected={showRecommendations}
            onPress={() => setShowRecommendations(!showRecommendations)}
          />
          <Chip
            label="Avisarme si un guardado cambia"
            selected={notifyOnChange}
            onPress={() => setNotifyOnChange(!notifyOnChange)}
          />
          <Text variant="label-md" tone="muted">
            El aviso aparece en Guardados. No hay notificaciones del sistema en esta demo.
          </Text>
        </Card>

        <Card>
          <Text variant="headline-sm">Disponibilidad voluntaria</Text>
          <Text tone="muted">
            Declarar habilidades no certifica nada y no te asigna tareas. Las tareas especializadas piden validación
            humana.
          </Text>
          <Chip
            label="Puedo colaborar cuando coincida el horario"
            icon="hand-heart-outline"
            selected={volunteerAvailable}
            onPress={() => setVolunteerAvailable(!volunteerAvailable)}
          />
          {VOLUNTEER_SKILLS.map((skill) => (
            <Chip
              key={skill.id}
              label={skill.label}
              selected={skills.includes(skill.id)}
              onPress={() => toggleSkill(skill.id)}
            />
          ))}
        </Card>
        </>
      ) : null}
      {part !== 'privacy' ? (
        <>

        <Button
          label="Ver el tutorial de nuevo"
          variant="outline"
          icon="school-outline"
          onPress={() => router.push('/onboarding')}
        />
        <SyncQueueCard />

        <Button
          label="Galería del sistema de diseño"
          variant="ghost"
          icon="palette-outline"
          onPress={() => router.push('/galeria')}
        />

        {confirmOut ? (
          <Card tone="warning">
            <Text variant="headline-sm">¿Cerrar sesión en este teléfono?</Text>
            <Text tone="muted">
              Se quita tu nombre público. Tus publicaciones y ajustes de privacidad siguen en el dispositivo.
            </Text>
            <Button label="Cerrar sesión" variant="danger" icon="logout" onPress={() => signOut()} />
            <Button label="Cancelar" variant="ghost" onPress={() => setConfirmOut(false)} />
          </Card>
        ) : (
          <Button label="Cerrar sesión" variant="ghost" icon="logout" onPress={() => setConfirmOut(true)} />
        )}
        </>
      ) : null}
    </>
  );
}
