import { lastSeen } from './sightings';
import type { Pet, PetSighting } from './types';

const NOW = new Date('2026-11-08T20:00:00Z').getTime();
const HOUR = 3_600_000;

const pet: Pet = {
  id: 'p1',
  slug: 'negrito',
  sectorId: 'lince',
  name: 'Negrito',
  description: '',
  homeZone: 'Parque',
  health: '',
  fundId: null,
  lastSeenAt: NOW - 2 * HOUR,
  lastSeenZone: 'cerca del parque',
  isDemo: true,
};

const sighting = (petId: string, hoursAgo: number, zone: string): PetSighting => ({
  id: `${petId}-${hoursAgo}`,
  petId,
  zone,
  kind: 'seen',
  createdAt: NOW - hoursAgo * HOUR,
});

describe('lastSeen', () => {
  it('usa el dato del perfil si no hay avistamientos propios', () => {
    expect(lastSeen(pet, [])).toEqual({ at: NOW - 2 * HOUR, zone: 'cerca del parque', mine: false });
  });

  it('prefiere el avistamiento propio más reciente de ese perrito', () => {
    const res = lastSeen(pet, [sighting('p1', 3, 'Mercado'), sighting('p1', 0.5, 'Cuadra 4'), sighting('otro', 0.1, 'X')]);
    expect(res).toEqual({ at: NOW - 0.5 * HOUR, zone: 'Cuadra 4', mine: true });
  });

  it('ignora avistamientos propios más viejos que el del perfil', () => {
    expect(lastSeen(pet, [sighting('p1', 5, 'Mercado')]).mine).toBe(false);
  });
});
