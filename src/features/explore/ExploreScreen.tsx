import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { useSectorStore } from '@/features/sector';
import {
  applyFilters,
  categoryText,
  countAdvancedFilters,
  DEFAULT_FILTERS,
  hasActiveFilters,
  HELP_CATEGORIES,
  PostCard,
  rankPosts,
  useNearbyPosts,
  type ExploreFilters,
  type PostCategoryId,
  type PostKind,
} from '@/features/posts';
import { CommunityMap } from '@/features/map';
import { Badge, Button, Card, Chip, Icon, Screen, SegmentedControl, Text, TextField } from '@/shared/ui';

import { FiltersSheet } from './components/FiltersSheet';

const isCategory = (value: string | undefined): value is PostCategoryId =>
  HELP_CATEGORIES.some((c) => c.id === value);
const isKind = (value: string | undefined): value is PostKind => value === 'offer' || value === 'request';

/**
 * Explorar = ayuda entre vecinos, en una lista simple: buscar, elegir categoría y abrir. El resto vive en
 * su propio lugar: el mapa se alterna aquí mismo con la lista, los negocios tienen su pestaña, y tipo/distancia están en «Filtros».
 */
export function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; category?: string; kind?: string }>();
  const sector = useSectorStore((s) => s.sector);
  const { data, isLoading, isError, refetch } = useNearbyPosts(sector.id);
  const posts = data?.posts;
  const now = data?.fetchedAt ?? 0;
  const radiusKm = sector.radiusKm;

  const [filters, setFilters] = useState<ExploreFilters>({
    ...DEFAULT_FILTERS,
    maxDistanceKm: radiusKm,
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [view, setView] = useState<'list' | 'map'>('list');

  // Atajos desde Inicio (búsqueda, categoría o tipo) llegan como parámetros de ruta.
  // Se aplican al cambiar la firma de los parámetros (ajuste de estado durante el render).
  const paramsSignature = `${params.q ?? ''}|${params.category ?? ''}|${params.kind ?? ''}`;
  const [appliedParams, setAppliedParams] = useState(paramsSignature);
  if (appliedParams !== paramsSignature) {
    setAppliedParams(paramsSignature);
    setFilters((f) => ({
      ...f,
      query: params.q ?? f.query,
      category: isCategory(params.category) ? params.category : f.category,
      kind: isKind(params.kind) ? params.kind : f.kind,
    }));
  }

  const results = useMemo(() => {
    if (!posts) return [];
    // Los emprendimientos tienen su propia sección (pestaña Negocios): aquí solo ayuda entre vecinos.
    const filtered = applyFilters(
      posts.filter((p) => p.category !== 'business'),
      filters,
      now,
    );
    return rankPosts(filtered, {
      now,
      radiusKm,
      query: filters.query,
      extraSearchText: categoryText,
    });
  }, [posts, filters, now, radiusKm]);

  // El botón «Filtros» cuenta tipo y distancia además de los avanzados.
  const activeCount =
    countAdvancedFilters(filters) + (filters.kind !== 'all' ? 1 : 0) + (filters.maxDistanceKm !== radiusKm ? 1 : 0);
  const resetAll = () => setFilters({ ...DEFAULT_FILTERS, maxDistanceKm: radiusKm });
  const filtersActive = hasActiveFilters(filters, radiusKm);

  return (
    <Screen noTopInset contentClassName="gap-4">
      <View className="gap-0.5">
        <Text variant="headline-lg" accessibilityRole="header">
          Día a día
        </Text>
        <Text tone="muted">Ayuda entre vecinos en {sector.name}</Text>
      </View>

      <View className="flex-row items-start gap-2">
        <View className="flex-1">
          <TextField
            label="Buscar en tu barrio"
            hideLabel
            leadingIcon="magnify"
            placeholder="Busca herramientas, oficios, ayuda…"
            value={filters.query}
            onChangeText={(query) => setFilters((f) => ({ ...f, query }))}
            onClear={() => setFilters((f) => ({ ...f, query: '' }))}
            returnKeyType="search"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={activeCount > 0 ? `Filtros, ${activeCount} activos` : 'Filtros'}
          onPress={() => setSheetOpen(true)}
          className="h-12 w-12 items-center justify-center rounded-2xl bg-surface-container-lowest shadow-sm elevation-xs active:opacity-80">
          <Icon name="tune-variant" size={22} color="primary" />
          {activeCount > 0 ? (
            <View className="absolute -right-1.5 -top-1.5 h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1">
              <Text variant="label-sm" tone="onSecondary">
                {activeCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pr-4">
        <Chip
          role="radio"
          label="Todo"
          icon="apps"
          selected={filters.category === 'all'}
          onPress={() => setFilters((f) => ({ ...f, category: 'all' }))}
        />
        {HELP_CATEGORIES.map((category) => (
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

      <SegmentedControl
        accessibilityLabel="Ver publicaciones como"
        value={view}
        onChange={setView}
        options={[
          { value: 'list', label: 'Lista', icon: 'format-list-bulleted' },
          { value: 'map', label: 'Mapa', icon: 'map-outline' },
        ]}
      />

      {isLoading ? (
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

          {results.length === 0 ? (
            <Card className="items-center gap-3 py-8">
              <Icon name="text-search" size={36} color="primary" />
              <Text variant="headline-sm" className="text-center">
                No encontramos resultados
              </Text>
              <Text tone="muted" className="text-center">
                Prueba con otras palabras, aumenta la distancia o quita algún filtro.
              </Text>
              {filtersActive ? <Button label="Quitar filtros" icon="filter-remove-outline" onPress={resetAll} /> : null}
              {!filters.includeNearbySectors ? (
                <Button
                  label="Ampliar a sectores cercanos"
                  variant="tonal"
                  icon="map-search-outline"
                  onPress={() => setFilters((f) => ({ ...f, includeNearbySectors: true }))}
                />
              ) : null}
            </Card>
          ) : view === 'map' ? (
            <CommunityMap posts={results.map((r) => r.post)} layers={['posts']} embedded height={380} />
          ) : (
            <View className="gap-3">
              {results.map(({ post }) => (
                <PostCard key={post.id} post={post} now={now} />
              ))}
            </View>
          )}
        </>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="¿Buscas un negocio del barrio? Abrir Negocios"
        onPress={() => router.push('/negocios')}
        className="flex-row items-center gap-3 rounded-2xl bg-primary-fixed p-3 active:opacity-80">
        <Icon name="storefront-outline" size={28} color="primary" />
        <View className="min-w-0 flex-1">
          <Text variant="body-md-medium" tone="primary">
            ¿Buscas un negocio del barrio?
          </Text>
          <Text variant="label-md" tone="muted">
            Bodegas, comida y servicios en Negocios
          </Text>
        </View>
        <Icon name="chevron-right" size={22} color="primary" />
      </Pressable>

      <Text variant="label-md" tone="muted">
        Ubicaciones aproximadas dentro de {radiusKm} km. Nunca mostramos direcciones exactas.
      </Text>

      <FiltersSheet
        visible={sheetOpen}
        filters={filters}
        radiusKm={radiusKm}
        resultCount={results.length}
        onChange={setFilters}
        onClose={() => setSheetOpen(false)}
      />
    </Screen>
  );
}
