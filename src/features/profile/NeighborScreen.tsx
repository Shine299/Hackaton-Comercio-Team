import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { TRUST_LABEL, useSavedStore, type TrustLevel } from '@/features/posts';
import { useRegistrationGate, useSessionStore } from '@/features/session';
import { useSectorStore } from '@/features/sector';
import { Badge, Button, Card, DemoTag, Icon, Screen, ScreenHeader, Text, type IconName } from '@/shared/ui';

import { getDemoNeighbor } from './demoNeighbors';
import { useProfilePrefsStore, VOLUNTEER_SKILLS } from './store';

const trustIcon = {
  new: 'sprout-outline',
  verified: 'check-decagram-outline',
  endorsed: 'shield-check-outline',
} as const satisfies Record<TrustLevel, IconName>;

/** Perfil público: el propio (según ajustes) o un vecino de demostración. */
export function NeighborScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profileId = String(id ?? '');
  const router = useRouter();
  const deviceId = useSessionStore((s) => s.deviceId);
  const registered = useSessionStore((s) => s.registered);
  const displayName = useSessionStore((s) => s.displayName);
  const sectorName = useSectorStore((s) => s.sector.name);
  const prefs = useProfilePrefsStore();
  const saved = useSavedStore((s) => s.profileIds.includes(profileId));
  const toggleProfile = useSavedStore((s) => s.toggleProfile);
  const { requireRegistration, sheet } = useRegistrationGate();
  const demo = getDemoNeighbor(profileId);
  const isOwn = profileId === deviceId;

  const skillLabels = VOLUNTEER_SKILLS.filter((skill) => prefs.skills.includes(skill.id)).map((skill) => skill.label);

  return (
    <Screen header={<ScreenHeader title="Perfil" backLabel="Volver" />} safeBottom>
      {isOwn ? (
        registered ? (
          <>
            <Card>
              <View className="flex-row items-center gap-3">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-fixed">
                  <Text variant="headline-sm" tone="primary">
                    {displayName.charAt(0)}
                  </Text>
                </View>
                <View className="min-w-0 flex-1 gap-1">
                  <Text variant="headline-md">{displayName}</Text>
                  <View className="flex-row items-center gap-1">
                    <Icon name={trustIcon.new} size={16} color="onSurfaceVariant" />
                    <Text variant="label-md" tone="muted">
                      {TRUST_LABEL.new}
                    </Text>
                  </View>
                </View>
              </View>
              {prefs.bio ? <Text>{prefs.bio}</Text> : <Text tone="muted">Sin frase pública todavía.</Text>}
              {prefs.showSector ? (
                <Text variant="label-md" tone="muted">
                  Sector aproximado: {sectorName}. Nunca se muestra tu ubicación exacta.
                </Text>
              ) : (
                <Text variant="label-md" tone="muted">
                  Ocultaste el sector en tus ajustes.
                </Text>
              )}
            </Card>
            <Card tone="low">
              <Text variant="headline-sm">Confianza progresiva</Text>
              <Text tone="muted">
                Así te verían tus vecinos.                 Seguirás como nuevo en la red hasta que un servidor pueda verificar
                identidad. Publicar en este teléfono no te marca como verificado ni con aval.
              </Text>
              <Badge label="Sin servidor · no verificado" tone="warning" icon="flask-outline" />
            </Card>
            {prefs.showRecommendations ? (
              <Card>
                <Text variant="headline-sm">Recomendaciones</Text>
                <Text tone="muted">Todavía no tienes comentarios de vecinos.</Text>
              </Card>
            ) : (
              <Text tone="muted">Ocultaste las recomendaciones en tus ajustes.</Text>
            )}
            <Card>
              <Text variant="headline-sm">Disponibilidad voluntaria</Text>
              <Text tone="muted">
                {prefs.volunteerAvailable
                  ? 'Marcaste que puedes colaborar. Eso no asigna tareas.'
                  : 'No marcaste disponibilidad. Puedes cambiarlo en Ajustes.'}
              </Text>
              {prefs.volunteerAvailable && skillLabels.length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  {skillLabels.map((label) => (
                    <Badge key={label} label={label} />
                  ))}
                </View>
              ) : null}
            </Card>
          </>
        ) : (
          <Card>
            <Text variant="headline-sm">Aún no tienes perfil público</Text>
            <Text tone="muted">Explorar sigue libre. El perfil pide solo un nombre y tu consentimiento.</Text>
            <Button
              label="Crear mi perfil"
              icon="account-plus-outline"
              onPress={() =>
                requireRegistration('Para tener un perfil público, crea tu cuenta vecinal.', () => undefined)
              }
            />
          </Card>
        )
      ) : demo ? (
        <>
          <DemoTag />
          <Card>
            <View className="flex-row items-center gap-3">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-fixed">
                <Text variant="headline-sm" tone="primary">
                  {demo.displayName.charAt(0)}
                </Text>
              </View>
              <View className="min-w-0 flex-1 gap-1">
                <Text variant="headline-md">{demo.displayName}</Text>
                <View className="flex-row items-center gap-1">
                  <Icon name={trustIcon[demo.trust]} size={16} color="onSurfaceVariant" />
                  <Text variant="label-md" tone="muted">
                    {TRUST_LABEL[demo.trust]}
                    {demo.recommendations > 0 ? ` · ${demo.recommendations} recom.` : ''}
                  </Text>
                </View>
              </View>
            </View>
            <Text>{demo.bio}</Text>
            <Text variant="label-md" tone="muted">
              Sector aproximado: {demo.sectorName}
            </Text>
          </Card>
          <Card>
            <Text variant="headline-sm">Recomendaciones de demostración</Text>
            {demo.comments.length === 0 ? (
              <Text tone="muted">Este perfil de demo aún no tiene comentarios. Ser nuevo no lo esconde de la red.</Text>
            ) : (
              demo.comments.map((comment) => (
                <View key={comment.id} className="gap-1 rounded-xl bg-surface-container-low p-3">
                  <Text variant="label-md">{comment.author}</Text>
                  <Text>{comment.text}</Text>
                </View>
              ))
            )}
          </Card>
          <Card>
            <Text variant="headline-sm">Disponibilidad voluntaria</Text>
            <Text tone="muted">
              {demo.volunteerAvailable
                ? 'Figura como disponible. En la app real eso no asigna tareas solas.'
                : 'No figura como disponible para tareas.'}
            </Text>
            {demo.skills.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {demo.skills.map((skill) => (
                  <Badge key={skill} label={skill} />
                ))}
              </View>
            ) : null}
          </Card>
          <Button
            label={saved ? 'Perfil guardado' : 'Guardar perfil'}
            variant="outline"
            icon={saved ? 'bookmark' : 'bookmark-outline'}
            onPress={() => {
              if (saved) toggleProfile(demo.id);
              else
                requireRegistration('Para guardar un perfil, crea tu cuenta vecinal.', () => toggleProfile(demo.id));
            }}
          />
        </>
      ) : (
        <Card>
          <Text variant="headline-sm">No encontramos este perfil</Text>
          <Text tone="muted">Puede ser un dato de otra sesión o un perfil que ya no está en la demo.</Text>
          <Button label="Volver" variant="tonal" icon="arrow-left" onPress={() => router.back()} />
        </Card>
      )}

      {isOwn && registered ? (
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text variant="label-md" tone="primary">
            Volver y editar en Ajustes
          </Text>
        </Pressable>
      ) : null}
      {sheet}
    </Screen>
  );
}
