import type { TrustLevel } from '@/features/posts';

/** Vecino ficticio. Los comentarios no son de personas reales. */
export type DemoNeighbor = {
  id: string;
  displayName: string;
  trust: TrustLevel;
  recommendations: number;
  sectorName: string;
  bio: string;
  skills: string[];
  volunteerAvailable: boolean;
  comments: { id: string; author: string; text: string }[];
};

/**
 * Perfiles de demostración, con los mismos identificadores que las publicaciones de demo.
 * Ningún nombre ni comentario es real.
 */
export const DEMO_NEIGHBORS: DemoNeighbor[] = [
  {
    id: 'demo-a1',
    displayName: 'Carlos V.',
    trust: 'verified',
    recommendations: 12,
    sectorName: 'Lince',
    bio: 'Presto herramientas del barrio y las recojo el mismo día.',
    skills: ['Herramientas'],
    volunteerAvailable: true,
    comments: [
      { id: 'c1', author: 'Vecina de demo', text: 'Me prestó la escalera y pasó a recogerla a la hora acordada.' },
    ],
  },
  {
    id: 'demo-a2',
    displayName: 'María T.',
    trust: 'endorsed',
    recommendations: 31,
    sectorName: 'Lince',
    bio: 'Apoyo con reforzamiento escolar en lugares públicos del sector.',
    skills: ['Acompañamiento'],
    volunteerAvailable: false,
    comments: [
      { id: 'c2', author: 'Vecino de demo', text: 'Las clases de matemáticas fueron claras y puntuales.' },
      { id: 'c3', author: 'Vecina de demo', text: 'Coordinó todo en la biblioteca, sin pedir la dirección de casa.' },
    ],
  },
  {
    id: 'demo-a3',
    displayName: 'Jorge R.',
    trust: 'verified',
    recommendations: 6,
    sectorName: 'Lince',
    bio: 'Trueques sencillos: libros, plantas y cosas en buen estado.',
    skills: [],
    volunteerAvailable: false,
    comments: [{ id: 'c4', author: 'Vecina de demo', text: 'El trueque de libros fue justo y rápido.' }],
  },
  {
    id: 'demo-a4',
    displayName: 'Lucía P.',
    trust: 'verified',
    recommendations: 9,
    sectorName: 'Lince',
    bio: 'Comparto viajes cortos dentro del distrito.',
    skills: ['Movilidad'],
    volunteerAvailable: true,
    comments: [{ id: 'c5', author: 'Vecino de demo', text: 'El punto de encuentro fue claro y no pidió la dirección.' }],
  },
  {
    id: 'demo-a5',
    displayName: 'Rosa H.',
    trust: 'new',
    recommendations: 0,
    sectorName: 'Lince',
    bio: 'Acabo de llegar a la red. Busco y ofrezco apoyo puntual.',
    skills: [],
    volunteerAvailable: false,
    comments: [],
  },
  {
    id: 'demo-a6',
    displayName: 'Eduardo M.',
    trust: 'endorsed',
    recommendations: 23,
    sectorName: 'Lince',
    bio: 'Arreglos menores de plomería. No sustituyo a un técnico certificado.',
    skills: ['Arreglos menores'],
    volunteerAvailable: true,
    comments: [{ id: 'c6', author: 'Vecina de demo', text: 'Revisó una fuga pequeña y explicó qué no podía hacer.' }],
  },
  {
    id: 'demo-a7',
    displayName: 'Mateo S.',
    trust: 'verified',
    recommendations: 4,
    sectorName: 'Lince',
    bio: 'Regalo objetos en buen estado para recoger en el barrio.',
    skills: [],
    volunteerAvailable: false,
    comments: [{ id: 'c7', author: 'Vecino de demo', text: 'La silla estaba como la describió.' }],
  },
  {
    id: 'demo-a8',
    displayName: 'Ana Q.',
    trust: 'new',
    recommendations: 0,
    sectorName: 'Lince',
    bio: 'Nueva en el sector. Publico con título claro y sin datos de contacto.',
    skills: ['Recados cercanos'],
    volunteerAvailable: true,
    comments: [],
  },
  {
    id: 'demo-a9',
    displayName: 'Pedro L.',
    trust: 'verified',
    recommendations: 7,
    sectorName: 'Lince',
    bio: 'Acompañamiento a trámites cercanos, en horario flexible.',
    skills: ['Acompañamiento', 'Recados cercanos'],
    volunteerAvailable: true,
    comments: [{ id: 'c8', author: 'Vecina de demo', text: 'Me acompañó al trámite y esperó el tiempo acordado.' }],
  },
];

export function getDemoNeighbor(id: string): DemoNeighbor | undefined {
  return DEMO_NEIGHBORS.find((neighbor) => neighbor.id === id);
}
