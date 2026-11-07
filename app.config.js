// Extiende app.json. `app.json` no puede leer variables de entorno, así que la clave de Google Maps
// para builds nativas (EAS / development build) se inyecta aquí. En Expo Go no hace falta.
// Sin clave, no se añade nada y la app usa la lista como alternativa al mapa.
module.exports = ({ config }) => {
  const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  if (!key) return config;
  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      ['react-native-maps', { androidGoogleMapsApiKey: key, iosGoogleMapsApiKey: key }],
    ],
  };
};
