import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { useOnboardingStore } from '@/features/onboarding';
import { TopBar } from '@/features/shell';

/** Navegación principal: Inicio · Explorar · Publicar · Actividad · Perfil. */
export default function TabsLayout() {
  const onboardingCompleted = useOnboardingStore((s) => s.completed);

  // Primera ejecución: tutorial. Las rutas de emergencia no pasan por aquí y nunca se bloquean.
  if (!onboardingCompleted) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      // La barra inferior vive en el diseño raíz (SectionBar) y cambia según la sección.
      tabBar={() => null}
      screenOptions={{
        header: () => <TopBar />,
        headerShown: true,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="explorar" options={{ title: 'Explorar' }} />
      <Tabs.Screen name="publicar" options={{ title: 'Publicar' }} />
      <Tabs.Screen name="negocios" options={{ title: 'Negocios' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
      {/* Sin pestaña propia: se abre desde la campana del Inicio (AppTabBar la omite). */}
      <Tabs.Screen name="actividad" options={{ title: 'Actividad' }} />
    </Tabs>
  );
}
