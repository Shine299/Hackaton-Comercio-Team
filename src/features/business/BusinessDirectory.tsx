import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import {
  applyFilters,
  categoryText,
  DEFAULT_FILTERS,
  filterFavorites,
  rankPosts,
  useNearbyPosts,
  useSavedStore,
} from '@/features/posts';
import { useSectorStore } from '@/features/sector';
import { Badge, Button, Card, Chip, cn, GRADIENTS, Icon, type IconName, SegmentedControl, StatRow, Text, TextField } from '@/shared/ui';
import { CommunityMap } from '@/features/map';

import { BusinessCard } from './BusinessCard';
import { BUSINESS_RUBROS, hasDelivery, rubroOf, type RubroId } from './rubros';

/** Categoría como botón cuadrado con icono (referencia: lienzo). */
function RubroButton({ label, icon, selected, onPress }: { label: string; icon: IconName; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected, checked: selected }}
      onPress={onPress}
      className="w-[72px] items-center gap-1.5 active:opacity-80">
      <View className={cn('h-16 w-16 items-center justify-center rounded-3xl shadow-sm elevation-xs', selected ? 'bg-primary' : 'bg-surface-container-lowest')}>
        <Icon name={icon} size={30} color={selected ? 'onPrimary' : 'primary'} />
      </View>
      <Text variant="label-md" numberOfLines={1} tone={selected ? 'primary' : 'default'}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Emprendimientos de vecinos: búsqueda, rubro, «Disponible ahora» y «Delivery». Vive dentro de Explorar (SPEC-047).
 * «Disponible ahora» lo declara el negocio: nunca se presenta como «abierto» (no hay horario estructurado, D3).
 */
export function BusinessDirectory() {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const { data, isLoading, isError, refetch } = useNearbyPosts(sector.id);
  const now = data?.fetchedAt ?? 0;
  const radiusKm = sector.radiusKm;

  const [query, setQuery] = useState('');
  const [rubro, setRubro] = useState<RubroId | 'all'>('all');
  const [availableNow, setAvailableNow] = useState(false);
  const [delivery, setDelivery] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const savedIds = useSavedStore((s) => s.postIds);
  const [view, setView] = useState<'list' | 'map'>('list');

  const results = useMemo(() => {
    if (!data) return [];
    const matched = applyFilters(
      data.posts,
      { ...DEFAULT_FILTERS, query, category: 'business', maxDistanceKm: radiusKm, availableNow },
      now,
    ).filter(
      (p) =>
        p.status === 'active' &&
        p.expiresAt > now &&
        (rubro === 'all' || rubroOf(p).id === rubro) &&
        (!delivery || hasDelivery(p)),
    );
    const pool = onlyFavorites ? filterFavorites(matched, savedIds) : matched;
    return rankPosts(pool, { now, radiusKm, query, extraSearchText: categoryText });
  }, [data, query, rubro, availableNow, delivery, onlyFavorites, savedIds, now, radiusKm]);

  const favoritesCount = useMemo(
    () => (data?.posts ?? []).filter((p) => p.category === 'business' && savedIds.includes(p.id)).length,
    [data, savedIds],
  );

  const filtersActive = query.trim().length > 0 || rubro !== 'all' || availableNow || delivery || onlyFavorites;
  const reset = () => {
    setQuery('');
    setRubro('all');
    setAvailableNow(false);
    setDelivery(false);
    setOnlyFavorites(false);
  };

  return (
    <View className="gap-4">
      <StatRow
        stats={[
          { icon: 'storefront-outline', value: results.length, label: 'cerca de ti', gradient: GRADIENTS.emprendimientos },
          { icon: 'check-circle-outline', value: results.filter((r) => r.post.availableNow).length, label: 'disponibles ahora', gradient: GRADIENTS.comunidad },
          { icon: 'moped-outline', value: results.filter((r) => hasDelivery(r.post)).length, label: 'con delivery', gradient: GRADIENTS.ayuda },
        ]}
      />

      <View className="flex-row gap-2.5">
        <View className="flex-1">
          <TextField
            label="Buscar emprendimientos"
            hideLabel
            leadingIcon="magnify"
            placeholder="Busca productos o servicios"
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery('')}
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pr-4" accessibilityRole="radiogroup">
        <RubroButton label="Todo" icon="apps" selected={rubro === 'all'} onPress={() => setRubro('all')} />
        {BUSINESS_RUBROS.map((r) => (
          <RubroButton key={r.id} label={r.label} icon={r.icon} selected={rubro === r.id} onPress={() => setRubro(r.id)} />
        ))}
      </ScrollView>

      <View className="flex-row flex-wrap gap-2">
        <Chip
          label="Disponible ahora"
          icon="check-circle-outline"
          selected={availableNow}
          onPress={() => setAvailableNow((v) => !v)}
        />
        <Chip label="Delivery" icon="moped-outline" selected={delivery} onPress={() => setDelivery((v) => !v)} />
        <Chip
          label={`Favoritos · ${favoritesCount}`}
          icon="heart-outline"
          selected={onlyFavorites}
          onPress={() => setOnlyFavorites((v) => !v)}
        />
      </View>

      <SegmentedControl
        accessibilityLabel="Ver emprendimientos como"
        value={view}
        onChange={setView}
        options={[
          { value: 'list', label: 'Lista', icon: 'format-list-bulleted' },
          { value: 'map', label: 'Mapa', icon: 'map-outline' },
        ]}
      />

      {isLoading ? (
        <View className="items-center py-10" accessibilityLabel="Cargando emprendimientos">
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <Card tone="warning">
          <Text variant="headline-sm">No pudimos cargar los emprendimientos</Text>
          <Text>Revisa tu conexión e inténtalo de nuevo.</Text>
          <Button label="Reintentar" icon="refresh" onPress={() => refetch()} />
        </Card>
      ) : (
        <>
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <Text variant="body-md-medium" accessibilityLiveRegion="polite">
              {results.length} {results.length === 1 ? 'emprendimiento cerca de ti' : 'emprendimientos cerca de ti'}
            </Text>
            <Badge label="Datos de demostración" tone="warning" icon="flask-outline" />
          </View>

          {results.length === 0 ? (
            <Card className="items-center gap-3 py-8">
              <Icon name={onlyFavorites ? 'heart-outline' : 'storefront-outline'} size={36} color="primary" />
              <Text variant="headline-sm" className="text-center">
                {onlyFavorites && favoritesCount === 0
                  ? 'Aún no tienes favoritos'
                  : filtersActive
                    ? 'No encontramos resultados'
                    : 'Aún no hay emprendimientos en tu sector'}
              </Text>
              <Text tone="muted" className="text-center">
                {onlyFavorites && favoritesCount === 0
                  ? 'Toca el corazón de un negocio para guardarlo aquí.'
                  : filtersActive
                  ? 'Prueba con otras palabras o quita algún filtro.'
                  : 'Sé el primero: registra el tuyo y aparecerá aquí.'}
              </Text>
              {filtersActive ? <Button label="Quitar filtros" icon="filter-remove-outline" onPress={reset} /> : null}
            </Card>
          ) : view === 'map' ? (
            <CommunityMap posts={results.map((r) => r.post)} layers={['business']} embedded height={380} />
          ) : (
            <View className="flex-row flex-wrap gap-3">
              {results.map(({ post }) => (
                <BusinessCard key={post.id} post={post} />
              ))}
            </View>
          )}
        </>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="¿Tienes un emprendimiento? Regístralo gratis"
        onPress={() => router.push('/negocios/registrar')}
        className="flex-row items-center gap-3.5 rounded-3xl border-2 border-dashed border-outline bg-surface-container-lowest px-4 py-3.5 active:opacity-80">
        <LinearGradient colors={GRADIENTS.emprendimientos} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 48, width: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="store-plus-outline" size={26} color="onPrimary" />
        </LinearGradient>
        <View className="flex-1">
          <Text variant="body-lg-bold">¿Tienes un emprendimiento?</Text>
          <Text variant="label-md" tone="muted">
            Regístralo gratis y que tus vecinos te encuentren
          </Text>
        </View>
        <Icon name="chevron-right" size={22} color="primary" />
      </Pressable>
    </View>
  );
}
