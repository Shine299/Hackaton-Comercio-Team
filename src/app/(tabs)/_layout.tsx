import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { useOnboardingStore } from '@/features/onboarding';
import { BackHeader } from '@/features/shell';

/**
 * Pantallas con barra inferior fija de 5 (SectionBar, en el diseño raíz):
 * Inicio · Comunidad · Emprendimientos · Emergencia · Ayuda. «Explorar» y «Publicar» se abren desde Ayuda.
 */
export default function TabsLayout() {
  const onboardingCompleted = useOnboardingStore((s) => s.completed);

  // Primera ejecución: tutorial. Las rutas de emergencia no pasan por aquí y nunca se bloquean.
  if (!onboardingCompleted) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      // La barra inferior vive en el diseño raíz (SectionBar).
      tabBar={() => null}
      screenOptions={{
        header: () => <BackHeader />,
        headerShown: true,
      }}>
      {/* Pantallas raíz con cabecera propia (SectionHeader). */}
      <Tabs.Screen name="index" options={{ title: 'Inicio', headerShown: false }} />
      <Tabs.Screen name="comunidad" options={{ title: 'Comunidad', headerShown: false }} />
      <Tabs.Screen name="ayuda" options={{ title: 'Ayuda', headerShown: false }} />
      <Tabs.Screen name="explorar" options={{ title: 'Quiero ayudar' }} />
      <Tabs.Screen name="publicar" options={{ title: 'Necesito ayuda' }} />
      <Tabs.Screen name="negocios" options={{ title: 'Emprendimientos', headerShown: false }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
      {/* Sin pestaña propia: se abre desde la campana. */}
      <Tabs.Screen name="actividad" options={{ title: 'Actividad' }} />
    </Tabs>
  );
}
