import type { Pet, PetSighting } from './types';

/** Último avistamiento: el propio más reciente si es más nuevo que el del perfil. */
export function lastSeen(pet: Pet, sightings: PetSighting[]): { at: number; zone: string; mine: boolean } {
  const mine = sightings.filter((s) => s.petId === pet.id).sort((a, b) => b.createdAt - a.createdAt)[0];
  if (mine && mine.createdAt > pet.lastSeenAt) return { at: mine.createdAt, zone: mine.zone, mine: true };
  return { at: pet.lastSeenAt, zone: pet.lastSeenZone, mine: false };
}
