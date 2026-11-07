import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { CommunityMap } from '@/features/map';
import { useSectorStore } from '@/features/sector';
import {
  applyFilters,
  categoryText,
  countAdvancedFilters,
  DEFAULT_FILTERS,
  hasActiveFilters,
  POST_CATEGORIES,
  PostCard,
  rankPosts,
  useNearbyPosts,
  type ExploreFilters,
  type PostCategoryId,
  type PostKind,
} from '@/features/posts';
import {
  Badge,
  Button,
  Card,
  Chip,
  Icon,
  Screen,
  SegmentedControl,
  Text,
  TextField,
} from '@/shared/ui';

import { FiltersSheet } from './components/FiltersSheet';

type ViewMode = 'list' | 'map';

const KIND_OPTIONS: { value: ExploreFilters['kind']; label: string }[] = [
  { value: 'all', label: 'Todo' },
  { value: 'offer', label: 'Ofrecen' },
  { value: 'request', label: 'Solicitan' },
];

const isCategory = (value: string | undefined): value is PostCategoryId =>
  POST_CATEGORIES.some((c) => c.id === value);
const isKind = (value: string | undefined): value is PostKind => value === 'offer' || value === 'request';

function FilterLabel({ children }: { children: string }) {
  return (
    <Text variant="label-md" tone="muted">
      {children}
    </Text>
  );
}

/** Explorar: lista de publicaciones con filtros esenciales visibles, avanzados en panel y acceso al mapa. */
export function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; category?: string; kind?: string; view?: string; t?: string }>();
  const sector = useSectorStore((s) => s.sector);
  const { data, isLoading, isError, refetch } = useNearbyPosts(sector.id);
  const posts = data?.posts;
  const now = data?.fetchedAt ?? 0;

  const [view, setView] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<ExploreFilters>({
    ...DEFAULT_FILTERS,
    maxDistanceKm: sector.radiusKm,
  });
  const [sheetOpen, setSheetOpen] = useState(false);

  // Atajos desde Inicio (busqueda o categoria) llegan como parametros de ruta.
  // Se aplican al cambiar la firma de los parametros (ajuste de estado durante el render).
  // `view=map` (con `t` para repetir el atajo) abre directamente el mapa, p. ej. desde Emergencias.
  const paramsSignature = `${params.q ?? ''}|${params.category ?? ''}|${params.kind ?? ''}|${params.view ?? ''}|${params.t ?? ''}`;
  const [appliedParams, setAppliedParams] = useState(paramsSignature);
  if (appliedParams !== paramsSignature) {
    setAppliedParams(paramsSignature);
    if (params.view === 'map') setView('map');
    setFilters((f) => ({
      ...f,
      query: params.q ?? f.query,
      category: isCategory(params.category) ? params.category : f.category,
      kind: isKind(params.kind) ? params.kind : f.kind,
    }));
  }
  const radiusKm = sector.radiusKm;

  const results = useMemo(() => {
    if (!posts) return [];
    const filtered = applyFilters(posts, filters, now);
    return rankPosts(filtered, {
      now,
      radiusKm,
      query: filters.query,
      extraSearchText: categoryText,
    });
  }, [posts, filters, now, radiusKm]);

  const advancedCount = countAdvancedFilters(filters);
  const distanceOptions = [0.5, 1, radiusKm];
  const resetAll = () => setFilters({ ...DEFAULT_FILTERS, maxDistanceKm: radiusKm });
  const filtersActive = hasActiveFilters(filters, radiusKm);

  return (
    <Screen noTopInset contentClassName="gap-4">
      <View className="flex-row items-start gap-2">
        <View className="flex-1">
          <TextField
            label="Buscar en tu barrio"
            hideLabel
            leadingIcon="magnify"
            placeholder={`Buscar en ${sector.name} (${radiusKm} km)…`}
            value={filters.query}
            onChangeText={(query) => setFilters((f) => ({ ...f, query }))}
            onClear={() => setFilters((f) => ({ ...f, query: '' }))}
            returnKeyType="search"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            advancedCount > 0 ? `Más filtros, ${advancedCount} activos` : 'Más filtros'
          }
          onPress={() => setSheetOpen(true)}
          className="h-12 min-w-12 items-center justify-center rounded-xl border-2 border-outline-variant bg-surface-container-lowest active:opacity-80">
          <Icon name="tune-variant" size={22} color="onSurface" />
          {advancedCount > 0 ? (
            <View className="absolute -right-1.5 -top-1.5 h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1">
              <Text variant="label-sm" tone="onSecondary">
                {advancedCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <SegmentedControl<ViewMode>
        accessibilityLabel="Vista de resultados"
        value={view}
        onChange={setView}
        options={[
          { value: 'list', label: 'Lista', icon: 'format-list-bulleted' },
          { value: 'map', label: 'Mapa barrial', icon: 'map-outline' },
        ]}
      />

      <View className="gap-3">
        <View className="gap-1.5">
          <FilterLabel>Tipo</FilterLabel>
          <View className="flex-row flex-wrap gap-2">
            {KIND_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                role="radio"
                label={option.label}
                selected={filters.kind === option.value}
                onPress={() => setFilters((f) => ({ ...f, kind: option.value }))}
              />
            ))}
          </View>
        </View>

        <View className="gap-1.5">
          <FilterLabel>Categoría</FilterLabel>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pr-4">
            <Chip
              role="radio"
              label="Todas"
              selected={filters.category === 'all'}
              onPress={() => setFilters((f) => ({ ...f, category: 'all' }))}
            />
            {POST_CATEGORIES.map((category) => (
              <Chip
                key={category.id}
                role="radio"
                label={category.label}
                icon={category.icon}
                selected={filters.category === category.id}
                onPress={() => setFilters((f) => ({ ...f, category: category.id }))}
              />
            ))}
          </ScrollView>
        </View>

        <View className="gap-1.5">
          <FilterLabel>Distancia</FilterLabel>
          <View className="flex-row flex-wrap gap-2">
            {distanceOptions.map((km) => (
              <Chip
                key={km}
                role="radio"
                label={km < 1 ? `${km * 1000} m` : `${km} km`}
                selected={filters.maxDistanceKm === km}
                onPress={() => setFilters((f) => ({ ...f, maxDistanceKm: km }))}
              />
            ))}
          </View>
        </View>
      </View>

      <View className="flex-row items-start gap-2 rounded-xl bg-surface-container-low p-3">
        <Icon name="shield-lock-outline" size={20} color="primary" />
        <Text variant="label-md" tone="muted" className="flex-1">
          Protección vecinal: las ubicaciones son aproximadas dentro de un radio de {radiusKm} km.
          Nunca mostramos direcciones exactas.
        </Text>
      </View>

      {view === 'map' ? (
        <>
          <CommunityMap posts={results.map((r) => r.post)} />
          <Button label="Volver a la lista" variant="tonal" icon="format-list-bulleted" onPress={() => setView('list')} />
        </>
      ) : isLoading ? (
        <View className="items-center py-10" accessibilityLabel="Cargando publicaciones">
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <Card tone="warning">
          <Text variant="headline-sm">No pudimos cargar las publicaciones</Text>
          <Text>Revisa tu conexión e inténtalo de nuevo. Lo que ya viste sigue disponible.</Text>
          <Button label="Reintentar" icon="refresh" onPress={() => refetch()} />
        </Card>
      ) : (
        <>
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <Text variant="body-md-medium" accessibilityLiveRegion="polite">
              {results.length} {results.length === 1 ? 'publicación' : 'publicaciones'}
            </Text>
            <Badge label="Datos de demostración" tone="warning" icon="flask-outline" />
          </View>
          <Text variant="label-md" tone="muted">
            Ordenadas por relevancia: cercanía, novedad y confianza de la comunidad.
          </Text>

          {results.length === 0 ? (
            <Card className="items-center gap-3 py-8">
              <Icon name="text-search" size={36} color="primary" />
              <Text variant="headline-sm" className="text-center">
                No encontramos resultados
              </Text>
              <Text tone="muted" className="text-center">
                Prueba con otras palabras, aumenta la distancia o quita algún filtro.
              </Text>
              {filtersActive ? (
                <Button label="Quitar filtros" icon="filter-remove-outline" onPress={resetAll} />
              ) : null}
              {!filters.includeNearbySectors ? (
                <Button
                  label="Ampliar a sectores cercanos"
                  variant="tonal"
                  icon="map-search-outline"
                  onPress={() => setFilters((f) => ({ ...f, includeNearbySectors: true }))}
                />
              ) : null}
            </Card>
          ) : (
            <View className="gap-3">
              {results.map(({ post }) => (
                <PostCard key={post.id} post={post} now={now} />
              ))}
            </View>
          )}
        </>
      )}

      <Card tone="low" className="items-center gap-2 py-6">
        <Icon name="account-group-outline" size={32} color="primary" />
        <Text variant="headline-sm" className="text-center">
          ¿Tienes algo para sumar hoy?
        </Text>
        <Text tone="muted" className="text-center">
          Prestar una escalera, regalar plantas o ayudar con un recado hace más fuerte a tu vecindario.
        </Text>
        <Button label="Crear publicación" icon="plus-circle-outline" onPress={() => router.push('/publicar')} />
      </Card>

      <FiltersSheet
        visible={sheetOpen}
        filters={filters}
        resultCount={results.length}
        onChange={setFilters}
        onClose={() => setSheetOpen(false)}
      />
    </Screen>
  );
}
