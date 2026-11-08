import { z } from 'zod';

import { startsAtFrom } from './logic';

export const MAX_DAYS_AHEAD = 30;
/** Horas que se ofrecen al crear un evento (6 a. m. a 10 p. m.). */
export const EVENT_HOURS = Array.from({ length: 17 }, (_, i) => i + 6);

/** Formulario de «Crear evento» (SPEC-046). `now` se inyecta para poder probar «no en el pasado». */
export function createEventSchema(now: number) {
  return z
    .object({
      title: z.string().trim().min(3, 'El título necesita al menos 3 letras.').max(120, 'Máximo 120 caracteres.'),
      body: z.string().max(400, 'Máximo 400 caracteres.'),
      dayOffset: z
        .number()
        .int()
        .min(0, 'Elige un día.')
        .max(MAX_DAYS_AHEAD, `Puedes crear eventos hasta ${MAX_DAYS_AHEAD} días adelante.`),
      hour: z.number().int().min(6).max(22),
      venueKind: z.enum(['public_place', 'approx_zone'], { error: 'Elige dónde será.' }),
      venueName: z.string().trim().min(2, 'Escribe el lugar o la zona.').max(80, 'Máximo 80 caracteres.'),
    })
    .refine((v) => startsAtFrom(v.dayOffset, v.hour, now) > now, {
      path: ['hour'],
      message: 'Esa hora ya pasó. Elige una más tarde.',
    });
}

export type CreateEventValues = z.input<ReturnType<typeof createEventSchema>>;
