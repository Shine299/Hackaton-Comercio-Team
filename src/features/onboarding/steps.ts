// Módulos puros (no el índice de `shared/ui`): así los pasos se pueden probar en Jest sin cargar Reanimated.
import { GRADIENTS } from '@/shared/ui/gradients';
import type { YuntaPose } from '@/shared/ui/yuntaPoses';

export type OnboardingDemo = 'interests' | 'steps' | 'sos' | 'offline' | 'viewmode';

export type OnboardingStep = {
  id: string;
  /** Gesto de Yunta que refuerza el objetivo del paso. */
  pose: YuntaPose;
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
 * Tutorial inicial interactivo (docs/03_accesibilidad_emergencias §2, SPEC-057). Yunta te habla como un amigo:
 * frases cortas, cálidas y algo para tocar en cada paso. Las pruebas del SOS y del modo avión son simulaciones:
 * no envían nada. El paso final de sector es interactivo y vive en la pantalla.
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    pose: 'wave',
    title: '¡Hola! Soy Yunta',
    body: 'Voy a acompañarte para que uses la app sin apuros. Será solo un ratito, y yo te voy guiando.',
    gradient: GRADIENTS.hero,
  },
  {
    id: 'explore',
    pose: 'curious',
    title: '¿Qué te gusta ver?',
    body: 'Toca lo que más te interese y te lo muestro primero. Y tranquilo: para mirar no necesitas cuenta.',
    gradient: GRADIENTS.comunidad,
    demo: 'interests',
  },
  {
    id: 'publish',
    pose: 'point',
    title: 'Pedir ayuda es muy fácil',
    body: 'Son solo 3 pasos. Tócalos uno por uno y mira cómo es.',
    gradient: GRADIENTS.ayuda,
    demo: 'steps',
  },
  {
    id: 'emergency',
    pose: 'shield',
    title: 'Si algo pasa, aquí estoy',
    body: 'El botón SOS siempre está arriba de la pantalla. Pruébalo: es de práctica, no se envía nada.',
    gradient: GRADIENTS.emergencia,
    demo: 'sos',
    notice: 'Yunta ayuda a coordinar entre vecinos, pero no reemplaza a los servicios oficiales de emergencia.',
  },
  {
    id: 'privacy',
    pose: 'lock',
    title: 'Tu casa es solo tuya',
    body: 'Solo mostramos tu zona, nunca tu dirección. Tú decides qué compartir.',
    gradient: GRADIENTS.emprendimientos,
    points: ['Funciona sin encender el GPS.', 'Tu ubicación exacta nunca se publica.'],
  },
  {
    id: 'offline',
    pose: 'phone',
    title: '¿Poca señal? Sin problema',
    body: 'Prueba el modo avión y verás cómo te aviso si algo ya llegó o si solo está guardado en tu teléfono.',
    gradient: GRADIENTS.recomendado,
    demo: 'offline',
  },
  {
    id: 'view-mode',
    pose: 'thumbs-up',
    title: 'Hazla cómoda para ti',
    body: 'Si prefieres letra más grande y botones más anchos, prueba el modo Fácil. Cambia al instante y lo puedes cambiar cuando quieras.',
    gradient: GRADIENTS.ayuda,
    demo: 'viewmode',
  },
];

/** Paso final: elegir sector (vive en la pantalla porque usa el selector real). */
export const SECTOR_STEP = {
  pose: 'map-pin' as YuntaPose,
  title: '¿Por dónde vives?',
  body: 'Así te cuento lo que pasa cerca de ti. Lo puedes cambiar cuando quieras.',
  gradient: GRADIENTS.comunidad,
};

/** Total de pasos incluyendo el paso final de sector. */
export const TOTAL_ONBOARDING_STEPS = ONBOARDING_STEPS.length + 1;
