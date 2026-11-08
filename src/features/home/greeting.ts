import type { IconName } from '@/shared/ui';

export type Greeting = { text: string; icon: IconName; line: string };

/** Saludo según la hora del día (hora local del teléfono), con una frase cálida para empezar. */
export function greetingFor(hour: number): Greeting {
  if (hour >= 5 && hour < 12) {
    return { text: 'Buenos días', icon: 'white-balance-sunny', line: '¿Qué hacemos hoy por tu barrio?' };
  }
  if (hour >= 12 && hour < 19) {
    return { text: 'Buenas tardes', icon: 'weather-sunset', line: 'Mira lo que se mueve cerca de ti.' };
  }
  return { text: 'Buenas noches', icon: 'weather-night', line: 'Aquí tienes a tus vecinos, a un toque.' };
}
