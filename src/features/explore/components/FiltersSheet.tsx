import { Pressable, View } from 'react-native';

import { DEFAULT_FILTERS, EXPANDED_COVERAGE_KM, type ExploreFilters } from '@/features/posts';
import { BottomSheet, Button, Chip, Text } from '@/shared/ui';

type FiltersSheetProps = {
  visible: boolean;
  filters: ExploreFilters;
  resultCount: number;
  onChange: (next: ExploreFilters) => void;
  onClose: () => void;
};

const POSTED_OPTIONS: { value: ExploreFilters['postedWithin']; label: string }[] = [
  { value: 'any', label: 'Cualquier fecha' },
  { value: 'today', label: 'Últimas 24 h' },
  { value: 'week', label: 'Esta semana' },
];

/** Panel de filtros avanzados (los esenciales viven visibles en la pantalla). */
export function FiltersSheet({ visible, filters, resultCount, onChange, onClose }: FiltersSheetProps) {
  const set = <K extends keyof ExploreFilters>(key: K, value: ExploreFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const reset = () =>
    onChange({
      ...filters,
      availableNow: DEFAULT_FILTERS.availableNow,
      verifiedOnly: DEFAULT_FILTERS.verifiedOnly,
      withRecommendations: DEFAULT_FILTERS.withRecommendations,
      postedWithin: DEFAULT_FILTERS.postedWithin,
      includeNearbySectors: DEFAULT_FILTERS.includeNearbySectors,
    });

  return (
    <BottomSheet
      visible={visible}
      title="Más filtros"
      onClose={onClose}
      headerAction={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpiar filtros avanzados"
          onPress={reset}
          className="min-h-11 justify-center px-2">
          <Text variant="body-md-medium" tone="primary">
            Limpiar
          </Text>
        </Pressable>
      }
      footer={
        <Button
          label={`Ver ${resultCount} ${resultCount === 1 ? 'resultado' : 'resultados'}`}
          size="lg"
          onPress={onClose}
        />
      }>
      <View className="gap-2">
        <Text variant="label-md" tone="muted">
          Disponibilidad y confianza
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <Chip
            label="Disponible ahora"
            icon="flash-outline"
            selected={filters.availableNow}
            onPress={() => set('availableNow', !filters.availableNow)}
          />
          <Chip
            label="Vecinos verificados"
            icon="check-decagram-outline"
            selected={filters.verifiedOnly}
            onPress={() => set('verifiedOnly', !filters.verifiedOnly)}
          />
          <Chip
            label="Con recomendaciones"
            icon="thumb-up-outline"
            selected={filters.withRecommendations}
            onPress={() => set('withRecommendations', !filters.withRecommendations)}
          />
        </View>
      </View>

      <View className="gap-2">
        <Text variant="label-md" tone="muted">
          Fecha de publicación
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {POSTED_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              role="radio"
              label={option.label}
              selected={filters.postedWithin === option.value}
              onPress={() => set('postedWithin', option.value)}
            />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <Text variant="label-md" tone="muted">
          Cobertura
        </Text>
        <Chip
          label={`Ampliar a sectores cercanos (hasta ${EXPANDED_COVERAGE_KM} km)`}
          icon="map-search-outline"
          selected={filters.includeNearbySectors}
          onPress={() => set('includeNearbySectors', !filters.includeNearbySectors)}
        />
        <Text variant="label-md" tone="muted">
          Por defecto solo ves tu sector. Amplía si buscas algo que no aparece cerca.
        </Text>
      </View>
    </BottomSheet>
  );
}
