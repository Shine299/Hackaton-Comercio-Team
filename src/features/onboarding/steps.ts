import { GRADIENTS, type IconName } from '@/shared/ui';

export type OnboardingDemo = 'interests' | 'steps' | 'sos' | 'offline';

export type OnboardingStep = {
  id: string;
  icon: IconName;
  title: string;
  body: string;
  /** Color del encabezado del paso. */
  gradient: readonly [string, string];
  /** Mini actividad para probar en el mismo paso. */
  demo?: OnboardingDemo;
  /** Lista corta opcional; frases breves y en lenguaje cotidiano. */
  points?: string[];
  /** Aviso de seguridad destacado. */
  notice?: string;
};

/**
 * Tutorial inicial interactivo (docs/03_accesibilidad_emergencias §2). Poco texto y algo para tocar en cada paso;
 * las pruebas del SOS y del modo avión son simulaciones: no envían nada.
 * El paso final de sector es interactivo y vive en la pantalla.
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    icon: 'account-group',
    title: 'Bienvenido a Yunta',
    body: 'Vecinos que se ayudan, compran local y se cuidan. Tu comunidad, más cerca.',
    gradient: GRADIENTS.hero,
  },
  {
    id: 'explore',
    icon: 'compass-outline',
    title: '¿Qué te interesa?',
    body: 'Elige lo que quieras ver primero. Explorar no necesita cuenta.',
    gradient: GRADIENTS.comunidad,
    demo: 'interests',
  },
  {
    id: 'publish',
    icon: 'plus-circle-outline',
    title: 'Pide u ofrece en 3 toques',
    body: 'Toca cada paso para verlo.',
    gradient: GRADIENTS.ayuda,
    demo: 'steps',
  },
  {
    id: 'emergency',
    icon: 'shield-alert-outline',
    title: 'Pide ayuda al instante',
    body: 'El botón SOS siempre está arriba. Pruébalo aquí: es solo una prueba.',
    gradient: GRADIENTS.emergencia,
    demo: 'sos',
    notice: 'Yunta coordina ayuda entre vecinos. No reemplaza a los servicios oficiales de emergencia.',
  },
  {
    id: 'privacy',
    icon: 'map-marker-radius-outline',
    title: 'Tu zona, no tu dirección',
    body: 'Mostramos solo tu zona aproximada. Tú eliges qué compartes.',
    gradient: GRADIENTS.emprendimientos,
    points: ['Funciona sin activar el GPS.', 'La ubicación exacta nunca se publica.'],
  },
  {
    id: 'offline',
    icon: 'cloud-off-outline',
    title: 'Funciona con poca señal',
    body: 'Prueba el modo avión: te diremos siempre si algo ya llegó o solo está en tu teléfono.',
    gradient: GRADIENTS.recomendado,
    demo: 'offline',
  },
];

/** Total de pasos incluyendo el paso final de sector. */
export const TOTAL_ONBOARDING_STEPS = ONBOARDING_STEPS.length + 1;
