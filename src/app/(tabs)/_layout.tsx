import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { useOnboardingStore } from '@/features/onboarding';
import { BackHeader } from '@/features/shell';

/**
 * Pantallas con barra inferior fija (SectionBar, en el diseño raíz, SPEC-051): Inicio · Comunidad (/eventos) ·
 * Negocios (/explorar) · Emergencia (/emergencias) · Marketplace (/marketplace). El chat es la burbuja flotante.
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
        // Cambiar de pestaña con un fundido corto, sin saltos.
        animation: 'fade',
      }}>
      {/* Pestañas: pantallas raíz con cabecera propia (SectionHeader). */}
      <Tabs.Screen name="index" options={{ title: 'Inicio', headerShown: false }} />
      <Tabs.Screen name="eventos" options={{ title: 'Eventos', headerShown: false }} />
      <Tabs.Screen name="explorar" options={{ title: 'Explorar', headerShown: false }} />
      <Tabs.Screen name="marketplace" options={{ title: 'Marketplace', headerShown: false }} />
      <Tabs.Screen name="mensajes" options={{ title: 'Chat', headerShown: false }} />
      {/* Se abren desde Marketplace, sin barra. */}
      <Tabs.Screen name="publicaciones" options={{ title: 'Marketplace' }} />
      <Tabs.Screen name="publicar" options={{ title: 'Publicar' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
      {/* Sin pestaña propia: se abre desde la campana. */}
      <Tabs.Screen name="actividad" options={{ title: 'Actividad' }} />
      {/* Rutas viejas que redirigen (enlaces y notificaciones ya programadas). */}
      <Tabs.Screen name="ayuda" options={{ headerShown: false }} />
      <Tabs.Screen name="comunidad" options={{ headerShown: false }} />
      <Tabs.Screen name="negocios" options={{ headerShown: false }} />
    </Tabs>
  );
}
