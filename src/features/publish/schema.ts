import { z } from 'zod';

import { POST_CATEGORY_IDS } from '@/features/posts';

export const EXPIRY_DAYS = [1, 3, 7, 14] as const;

export const publishSchema = z.object({
  kind: z.enum(['offer', 'request'], { error: 'Elige si ofreces o solicitas.' }),
  category: z.enum(POST_CATEGORY_IDS, { error: 'Elige una categoría para continuar.' }),
  title: z
    .string()
    .trim()
    .min(8, 'El título necesita al menos 8 caracteres. Ejemplo: «Presto mi escalera».'),
  description: z.string().max(500, 'Máximo 500 caracteres.'),
  extra1: z.string(),
  extra2: z.string(),
  priceLabel: z.string(),
  urgent: z.boolean(),
  availableNow: z.boolean(),
  photoUri: z.string(),
  voiceUsed: z.boolean(),
  expiryDays: z.union([z.literal(1), z.literal(3), z.literal(7), z.literal(14)]),
});

export type PublishFormValues = z.input<typeof publishSchema>;

export const EMPTY_PUBLISH: PublishFormValues = {
  kind: undefined as unknown as PublishFormValues['kind'],
  category: undefined as unknown as PublishFormValues['category'],
  title: '',
  description: '',
  extra1: '',
  extra2: '',
  priceLabel: '',
  urgent: false,
  availableNow: true,
  photoUri: '',
  voiceUsed: false,
  expiryDays: 7,
};

export const step2Fields = ['kind', 'category', 'title'] as const satisfies readonly (keyof PublishFormValues)[];
