const path = require('path');

const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
// inlineRem: 16 => 1rem = 16 dp en nativo (igual que en la web/Stitch). El valor por defecto es 14.
const config = withNativewind(getDefaultConfig(__dirname), { inlineRem: 16 });

/**
 * Workaround (NativeWind v5 RC + React Native 0.88):
 * `react-native-css` reemplaza `import ... from 'react-native'` por una lista fija de exports
 * que NO incluye `AssetRegistry`. `expo-asset`/`expo-font` lo necesitan, y sin él fallan
 * (“Cannot read property 'getAssetByID' of undefined”): no cargan las fuentes ni los iconos.
 *
 * Solución: el código de dependencias (node_modules) usa el `react-native` real en nativo.
 * Solo nuestro código (`src/`) pasa por el wrapper de className. Las librerías no usan className.
 * Quitar cuando NativeWind/react-native-css exporten `AssetRegistry`.
 */
const nodeModulesSegment = `${path.sep}node_modules${path.sep}`;
const upstreamResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'react-native' &&
    platform !== 'web' &&
    context.originModulePath.includes(nodeModulesSegment)
  ) {
    return context.resolveRequest(context, moduleName, platform);
  }
  return upstreamResolveRequest
    ? upstreamResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
