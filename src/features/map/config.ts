/**
 * Solo informativo: hay clave de Google Maps para builds nativas (EAS / development build).
 * En Expo Go el mapa funciona sin clave, así que ya no condiciona qué se muestra.
 */
export const HAS_MAPS_KEY = Boolean(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim());
