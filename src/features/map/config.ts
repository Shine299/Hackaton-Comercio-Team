/**
 * El mapa nativo solo se muestra si hay API key de Google Maps. Sin ella la app abre igual y
 * ofrece la misma información en lista. (`EXPO_PUBLIC_*` se resuelve al empaquetar.)
 */
export const HAS_MAPS_KEY = Boolean(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim());
