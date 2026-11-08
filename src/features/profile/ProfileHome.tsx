import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { PostCard, TRUST_LABEL, useLocalPostsStore } from '@/features/posts';
import { useSessionStore } from '@/features/session';
import { useSectorStore } from '@/features/sector';
import { usePickPhoto } from '@/shared/hooks/usePickPhoto';
import { Avatar, Badge, Button, Card, Icon, Text } from '@/shared/ui';

import { useProfilePrefsStore, VOLUNTEER_SKILLS } from './store';

/** Vista del perfil propio: identidad, confianza honesta y publicaciones de este teléfono. */
export function ProfileHome() {
  const router = useRouter();
  const displayName = useSessionStore((s) => s.displayName);
  const deviceId = useSessionStore((s) => s.deviceId);
  const photoUri = useSessionStore((s) => s.photoUri);
  const setPhoto = useSessionStore((s) => s.setPhoto);
  const picker = usePickPhoto();
  // La foto elegida (sin EXIF) pasa a ser la del perfil.
  useEffect(() => {
    if (picker.photoUri) setPhoto(picker.photoUri);
  }, [picker.photoUri, setPhoto]);
  const sectorName = useSectorStore((s) => s.sector.name);
  const posts = useLocalPostsStore((s) => s.posts);
  const bio = useProfilePrefsStore((s) => s.bio);
  const showSector = useProfilePrefsStore((s) => s.showSector);
  const volunteerAvailable = useProfilePrefsStore((s) => s.volunteerAvailable);
  const skills = useProfilePrefsStore((s) => s.skills);

  const skillLabels = VOLUNTEER_SKILLS.filter((skill) => skills.includes(skill.id)).map((skill) => skill.label);

  return (
    <>
      <Card>
        <View className="flex-row items-center gap-3">
          <Avatar name={displayName} id={deviceId} size={56} uri={photoUri} accessibilityLabel={`Tu foto de perfil, ${displayName}`} />
          <View className="min-w-0 flex-1 gap-1">
            <Text variant="headline-md">{displayName}</Text>
            <View className="flex-row items-center gap-1">
              <Icon name="sprout-outline" size={16} color="onSurfaceVariant" />
              <Text variant="label-md" tone="muted">
                {TRUST_LABEL.new}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row gap-2">
          <Button
            label={photoUri ? 'Cambiar foto' : 'Poner foto'}
            variant="tonal"
            icon="camera-outline"
            fullWidth={false}
            className="flex-1"
            onPress={() => void picker.pick()}
          />
          {photoUri ? (
            <Button
              label="Quitar foto"
              variant="ghost"
              icon="close"
              fullWidth={false}
              onPress={() => {
                picker.clear();
                setPhoto(undefined);
              }}
            />
          ) : null}
        </View>
        <Text variant="label-md" tone="muted">
          {picker.hint ?? 'Opcional. La foto se queda solo en este teléfono: tus vecinos ven tus iniciales.'}
        </Text>
        <Text>{bio.trim() || 'Añade una frase pública en Ajustes. Sin teléfono ni dirección.'}</Text>
        {showSector ? (
          <Text variant="label-md" tone="muted">
            Sector aproximado: {sectorName}
          </Text>
        ) : null}
      </Card>

      <Card tone="low">
        <Text variant="headline-sm">Confianza progresiva</Text>
        <Text tone="muted">
          Tu perfil es público dentro de lo que elijas mostrar. La verificación y el aval llegan con el servidor.
          Lo que publicas aquí queda en el teléfono y no cuenta como identidad verificada.
        </Text>
        <View className="flex-row gap-2">
          <Badge label={`${posts.length} en tu teléfono`} icon="file-document-outline" />
          <Badge label={TRUST_LABEL.new} tone="primary" icon="sprout-outline" />
        </View>
      </Card>

      <Card>
        <Text variant="headline-sm">Voluntariado</Text>
        <Text tone="muted">
          {volunteerAvailable
            ? 'Marcaste disponibilidad. Nadie te asigna una tarea por eso.'
            : 'Sin disponibilidad marcada. Puedes activarla en Ajustes, sin obligación.'}
        </Text>
        {skillLabels.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {skillLabels.map((label) => (
              <Badge key={label} label={label} />
            ))}
          </View>
        ) : null}
      </Card>

      <Button
        label="Ver cómo me ven"
        variant="outline"
        icon="eye-outline"
        onPress={() => router.push({ pathname: '/vecino/[id]', params: { id: deviceId } })}
      />

      <Text variant="headline-sm">Mis publicaciones</Text>
      {posts.length === 0 ? (
        <Text tone="muted">Cuando publiques, aparecerán aquí con el estado «Guardado en tu teléfono».</Text>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} now={post.createdAt} compact />)
      )}
    </>
  );
}
