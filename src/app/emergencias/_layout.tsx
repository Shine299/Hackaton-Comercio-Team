import { Stack } from 'expo-router';

import { EmergencyHeader } from '@/features/emergency';

/** Stack del Modo Emergencia. Es un stack aparte: no añade pestañas ni altera la navegación principal. */
export default function EmergenciasLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        animation: 'ios_from_right',
        header: ({ route, options }) => (
          <EmergencyHeader
            title={typeof options.title === 'string' ? options.title : undefined}
            backToCenter={route.name !== 'index'}
          />
        ),
      }}>
      <Stack.Screen name="index" options={{ title: 'Emergencia', headerShown: false }} />
      <Stack.Screen name="necesito-ayuda" options={{ title: 'Necesito ayuda' }} />
      <Stack.Screen name="reportar" options={{ title: 'Reportar incidente' }} />
      <Stack.Screen name="estado/[id]" options={{ title: 'Estado del reporte' }} />
      <Stack.Screen name="ofrecer" options={{ title: 'Ofrecer ayuda' }} />
      <Stack.Screen name="recursos" options={{ title: 'Necesidades y recursos' }} />
      <Stack.Screen name="vecino-vulnerable" options={{ title: 'Vecino vulnerable' }} />
      <Stack.Screen name="tablero" options={{ title: 'Tablero del sector' }} />
      <Stack.Screen name="mis-reportes" options={{ title: 'Mis reportes' }} />
      <Stack.Screen name="acompaname" options={{ title: 'Acompáñame' }} />
    </Stack>
  );
}
