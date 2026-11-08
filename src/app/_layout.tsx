import '@/global.css';

import { useFonts } from '@expo-google-fonts/inter/useFonts';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BoardNotifier } from '@/features/notifications';
import { BrandSplash, EdgeSwipe, ProfileDrawer, SectionBar } from '@/features/shell';
import { ActivityBadgeSync } from '@/features/activity';
import { ChatFab } from '@/features/chat';
import { hasServerTransport, useOutboxStore } from '@/features/outbox';
import { reconcileWithServer, registerSupabaseTransport, syncNow } from '@/features/sync';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { AppState, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();
registerSupabaseTransport();

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [showBrand, setShowBrand] = useState(true);
  const hideBrand = useCallback(() => setShowBrand(false), []);

  // Al abrir la app y al volver a primer plano, intenta enviar lo que quedó pendiente.
  useEffect(() => {
    if (!hasServerTransport()) return;
    const flush = () => void syncNow();
    flush();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && flush());
    // Cada intento manual desde Ajustes también refresca los estados con lo que confirmó el servidor.
    const unsubscribe = useOutboxStore.subscribe((state, prev) => {
      if (state.lastAttemptAt !== prev.lastAttemptAt && !state.flushing) void reconcileWithServer();
    });
    return () => {
      sub.remove();
      unsubscribe();
    };
  }, []);
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  // Si la fuente falla, la app sigue funcionando con la fuente del sistema.
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <BoardNotifier />
        <ActivityBadgeSync />
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#f9f9ff' },
              // Entrada suave tipo iOS también en Android (la pantalla anterior se desplaza un poco).
              animation: 'ios_from_right',
              gestureEnabled: true,
            }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" options={{ gestureEnabled: false, animation: 'fade' }} />
            <Stack.Screen name="publicacion/[id]" />
            <Stack.Screen name="vecino/[id]" />
            <Stack.Screen name="chat/[id]" />
            <Stack.Screen name="negocios/registrar" />
            <Stack.Screen name="fondos/[id]" />
            <Stack.Screen name="fondos/aportar/[id]" />
            <Stack.Screen name="camaras/index" />
            <Stack.Screen name="camaras/[id]" />
            <Stack.Screen name="camaras/registrar" />
            <Stack.Screen name="perrito/[slug]" />
            <Stack.Screen name="emergencias" />
            <Stack.Screen name="sector" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="galeria" />
          </Stack>
          <ChatFab />
          </View>
          <SectionBar />
          <EdgeSwipe />
          {showBrand ? <BrandSplash onDone={hideBrand} /> : null}
        </View>
        <ProfileDrawer />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
