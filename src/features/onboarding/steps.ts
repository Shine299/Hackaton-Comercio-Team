import type { IconName } from '@/shared/ui';

export type OnboardingStep = {
  id: string;
  icon: IconName;
  title: string;
  body: string;
  /** Lista corta opcional; frases breves y en lenguaje cotidiano. */
  points?: string[];
  /** Aviso de seguridad destacado. */
  notice?: string;
};

/**
 * Tutorial inicial (docs/03_accesibilidad_emergencias §2).
 * Los 6 pasos informativos; el paso final de sector es interactivo y vive en la pantalla.
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    icon: 'account-group',
    title: 'Tu comunidad, más cerca',
    body: 'Red Vecinal Solidaria conecta a vecinos para resolver necesidades del día a día y coordinar apoyo cuando hay una emergencia.',
  },
  {
    id: 'explore',
    icon: 'compass-outline',
    title: 'Explora sin registrarte',
    body: 'Mira lo que ofrecen y necesitan tus vecinos, sin crear una cuenta.',
    points: [
      'Para escribir o participar, te pediremos registrarte.',
      'Para reportar una emergencia, no necesitas cuenta.',
    ],
  },
  {
    id: 'publish',
    icon: 'plus-circle-outline',
    title: 'Ofrece o solicita en 3 pasos',
    body: 'Publicar es rápido. Puedes escribir, hablar o usar una tarjeta lista.',
    points: ['1. Elige Ofrecer o Solicitar.', '2. Escoge una categoría y completa la tarjeta.', '3. Toca Publicar.'],
  },
  {
    id: 'emergency',
    icon: 'shield-alert-outline',
    title: 'Pide ayuda y reporta incidentes',
    body: 'El botón SOS está siempre arriba. Desde ahí puedes pedir ayuda, reportar un incidente o ayudar a un vecino vulnerable.',
    notice:
      'Esta app coordina ayuda entre vecinos. No reemplaza a los servicios oficiales de emergencia.',
  },
  {
    id: 'privacy',
    icon: 'map-marker-radius-outline',
    title: 'Tu ubicación y tu privacidad',
    body: 'Mostramos tu zona aproximada, nunca tu dirección exacta. La ubicación precisa solo la ve personal autorizado cuando es necesario.',
    points: ['Puedes usar la app sin activar el GPS.', 'Tú eliges qué datos compartes.'],
  },
  {
    id: 'offline',
    icon: 'cloud-off-outline',
    title: 'Funciona con poca señal',
    body: 'Guardamos en tu teléfono lo esencial y lo que escribes. Siempre te diremos si algo solo está guardado en tu teléfono o ya llegó al servidor.',
    notice: 'Sin conexión, un reporte queda guardado, pero aún no recibido.',
  },
];

/** Total de pasos incluyendo el paso final de sector. */
export const TOTAL_ONBOARDING_STEPS = ONBOARDING_STEPS.length + 1;
