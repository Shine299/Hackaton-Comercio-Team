import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { PostCard, useNearbyPosts, useSavedStore, type SavedCollection } from '@/features/posts';
import { useSectorStore } from '@/features/sector';
import { BottomSheet, Button, Card, Chip, Text, TextField } from '@/shared/ui';

import { getDemoNeighbor } from './demoNeighbors';

/** Colección predeterminada más las que la persona crea. */
export function ProfileSaved() {
  const router = useRouter();
  const sectorId = useSectorStore((s) => s.sector.id);
  const { data, isLoading } = useNearbyPosts(sectorId);
  const now = data?.fetchedAt ?? 0;
  const postIds = useSavedStore((s) => s.postIds);
  const profileIds = useSavedStore((s) => s.profileIds);
  const collections = useSavedStore((s) => s.collections);
  const notifyOnChange = useSavedStore((s) => s.notifyOnChange);
  const createCollection = useSavedStore((s) => s.createCollection);
  const removeCollection = useSavedStore((s) => s.removeCollection);
  const togglePostInCollection = useSavedStore((s) => s.togglePostInCollection);
  const [selectedId, setSelectedId] = useState('all');
  const [draftName, setDraftName] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [creating, setCreating] = useState(false);
  const [assignPostId, setAssignPostId] = useState<string | null>(null);

  const activeId = selectedId === 'all' || collections.some((item) => item.id === selectedId) ? selectedId : 'all';
  const active: SavedCollection | undefined = collections.find((item) => item.id === activeId);
  const visiblePostIds = active ? active.postIds : postIds;
  const visibleProfileIds = active ? active.profileIds : profileIds;
  const posts = (data?.posts ?? []).filter((post) => visiblePostIds.includes(post.id));
  const changed = notifyOnChange
    ? (data?.posts ?? []).filter(
        (post) =>
          postIds.includes(post.id) &&
          (post.expiresAt <= now || post.status === 'closed' || post.status === 'expired' || post.status === 'completed'),
      )
    : [];

  const saveCollection = () => {
    const id = createCollection(draftName);
    if (!id) {
      setNameError('Usa entre 2 y 30 caracteres. Ejemplo: «Herramientas».');
      return;
    }
    setDraftName('');
    setNameError(undefined);
    setCreating(false);
    setSelectedId(id);
  };

  return (
    <>
      <Text tone="muted">
        «Todos los guardados» junta publicaciones y perfiles. Las colecciones solo agrupan; no borran el guardado
        general.
      </Text>

      {changed.length > 0 ? (
        <Card tone="warning">
          <Text variant="headline-sm">
            {changed.length === 1
              ? '1 guardado cambió de estado'
              : `${changed.length} guardados cambiaron de estado`}
          </Text>
          <Text tone="muted">Vencieron, se cerraron o se completaron. El aviso es local: no hay notificación push.</Text>
        </Card>
      ) : null}

      <View className="flex-row flex-wrap gap-2">
        <Chip label="Todos los guardados" role="radio" selected={activeId === 'all'} onPress={() => setSelectedId('all')} />
        {collections.map((collection) => (
          <Chip
            key={collection.id}
            label={collection.name}
            role="radio"
            selected={activeId === collection.id}
            onPress={() => setSelectedId(collection.id)}
          />
        ))}
      </View>

      {creating ? (
        <Card>
          <TextField
            label="Nombre de la colección"
            placeholder="Ejemplo: Herramientas"
            value={draftName}
            onChangeText={setDraftName}
            error={nameError}
            maxLength={30}
          />
          <Button label="Crear colección" icon="check" onPress={saveCollection} />
          <Button label="Cancelar" variant="ghost" onPress={() => setCreating(false)} />
        </Card>
      ) : (
        <Button label="Nueva colección" variant="outline" icon="folder-plus-outline" onPress={() => setCreating(true)} />
      )}

      {active ? (
        <Button label="Eliminar esta colección" variant="ghost" icon="delete-outline" onPress={() => removeCollection(active.id)} />
      ) : null}

      {!isLoading && posts.length === 0 && visibleProfileIds.length === 0 ? (
        <Text tone="muted">Nada en esta colección. Guarda una publicación desde su detalle.</Text>
      ) : null}

      {posts.map((post) => (
        <View key={post.id} className="gap-2">
          <PostCard post={post} now={now} compact />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Elegir colecciones para ${post.title}`}
            onPress={() => setAssignPostId(post.id)}
            className="min-h-11 justify-center">
            <Text variant="label-md" tone="primary">
              Añadir a una colección
            </Text>
          </Pressable>
        </View>
      ))}

      {visibleProfileIds.map((profileId) => {
        const neighbor = getDemoNeighbor(profileId);
        const label = neighbor?.displayName ?? 'Perfil guardado';
        return (
          <Pressable
            key={profileId}
            accessibilityRole="button"
            accessibilityLabel={`Abrir perfil de ${label}`}
            onPress={() => router.push({ pathname: '/vecino/[id]', params: { id: profileId } })}>
            <Card>
              <Text variant="body-md-medium">{label}</Text>
              <Text variant="label-md" tone="muted">
                {neighbor ? 'Perfil de demostración' : 'Perfil guardado en este teléfono'}
              </Text>
            </Card>
          </Pressable>
        );
      })}

      <BottomSheet
        visible={assignPostId !== null}
        title="Colecciones"
        onClose={() => setAssignPostId(null)}
        footer={<Button label="Listo" onPress={() => setAssignPostId(null)} />}>
        {collections.length === 0 ? (
          <Text tone="muted">Crea una colección arriba y vuelve a abrir esta lista.</Text>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {collections.map((collection) => (
              <Chip
                key={collection.id}
                label={collection.name}
                selected={assignPostId ? collection.postIds.includes(assignPostId) : false}
                onPress={() => {
                  if (assignPostId) togglePostInCollection(collection.id, assignPostId);
                }}
              />
            ))}
          </View>
        )}
      </BottomSheet>
    </>
  );
}
