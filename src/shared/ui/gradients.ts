/** Degradados de Inicio: cada sección tiene su propio color para reconocerla de un vistazo. */
export type Gradient = readonly [string, string];

export const GRADIENTS = {
  // Paleta de marca. Llevan texto blanco encima: ambos extremos tienen contraste ≥ 4,5:1 con blanco.
  hero: ['#4A1BA0', '#6A2BD9'],
  comunidad: ['#6A2BD9', '#8B4FE8'],
  emprendimientos: ['#C2410C', '#BE185D'],
  emergencia: ['#B91C1C', '#DC2626'],
  ayuda: ['#5B22C6', '#7B3FE4'],
  // Familia del amarillo Yunta, oscurecida para que el texto blanco se lea.
  recomendado: ['#8A5A00', '#9E6400'],
} as const satisfies Record<string, Gradient>;

/** Degradado de una publicación según su categoría. */
export function gradientForCategory(category: string): Gradient {
  switch (category) {
    case 'business':
      return GRADIENTS.emprendimientos;
    case 'tools':
    case 'products':
    case 'barter':
      return GRADIENTS.ayuda;
    case 'care':
      return GRADIENTS.emergencia;
    case 'pets':
    case 'mobility':
      return GRADIENTS.recomendado;
    default:
      return GRADIENTS.comunidad;
  }
}
