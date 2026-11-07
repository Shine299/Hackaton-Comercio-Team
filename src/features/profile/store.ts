import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/shared/storage/kv';

export const VOLUNTEER_SKILLS = [
  { id: 'tools', label: 'Herramientas' },
  { id: 'repairs', label: 'Arreglos menores' },
  { id: 'mobility', label: 'Movilidad' },
  { id: 'company', label: 'Acompañamiento' },
  { id: 'errands', label: 'Recados cercanos' },
] as const;

export type VolunteerSkillId = (typeof VOLUNTEER_SKILLS)[number]['id'];

/**
 * Preferencias del perfil en este teléfono. La verificación de identidad no vive aquí:
 * hasta que exista servidor, la persona sigue como «Nueva en la red».
 */
type ProfilePrefsState = {
  bio: string;
  showSector: boolean;
  showRecommendations: boolean;
  volunteerAvailable: boolean;
  skills: VolunteerSkillId[];
  setBio: (bio: string) => void;
  setShowSector: (value: boolean) => void;
  setShowRecommendations: (value: boolean) => void;
  setVolunteerAvailable: (value: boolean) => void;
  toggleSkill: (id: VolunteerSkillId) => void;
};

export const useProfilePrefsStore = create<ProfilePrefsState>()(
  persist(
    (set) => ({
      bio: '',
      showSector: true,
      showRecommendations: true,
      volunteerAvailable: false,
      skills: [],
      setBio: (bio) => set({ bio: bio.slice(0, 140) }),
      setShowSector: (showSector) => set({ showSector }),
      setShowRecommendations: (showRecommendations) => set({ showRecommendations }),
      setVolunteerAvailable: (volunteerAvailable) => set({ volunteerAvailable }),
      toggleSkill: (id) =>
        set((state) => ({
          skills: state.skills.includes(id) ? state.skills.filter((skill) => skill !== id) : [...state.skills, id],
        })),
    }),
    { name: 'rvs.profile.v1', storage: createJSONStorage(() => kvStorage) },
  ),
);
