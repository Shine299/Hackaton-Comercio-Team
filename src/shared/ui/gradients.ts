/** Degradados de Inicio: cada sección tiene su propio color para reconocerla de un vistazo. */
export type Gradient = readonly [string, string];

export const GRADIENTS = {
  hero: ['#0f5b5c', '#2a8f9a'],
  comunidad: ['#0f8b8d', '#41d1c0'],
  emprendimientos: ['#ff8a3d', '#ff4f7b'],
  emergencia: ['#e5383b', '#ff7a59'],
  ayuda: ['#5b4bdb', '#3aa0ff'],
  recomendado: ['#f5b700', '#ff8a3d'],
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
