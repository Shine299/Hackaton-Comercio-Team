/** Perrito comunitario: lo cuidan los vecinos. Su zona siempre es aproximada. */
export type Pet = {
  id: string;
  /** Lo que va en el QR del collar: yunta://perrito/<slug>. */
  slug: string;
  sectorId: string;
  name: string;
  description: string;
  /** Zona donde vive, en texto (parque, cuadra). Nunca coordenadas. */
  homeZone: string;
  health: string;
  /** Fondo permanente para veterinaria y comida. */
  fundId: string | null;
  lastSeenAt: number;
  lastSeenZone: string;
  isDemo: boolean;
};

/** «Lo vi» o «Necesita ayuda», guardado en este teléfono. Solo zona aproximada. */
export type PetSighting = {
  id: string;
  petId: string;
  zone: string;
  kind: 'seen' | 'needs-help';
  createdAt: number;
};
