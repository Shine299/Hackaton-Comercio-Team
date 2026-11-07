import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/shared/storage/kv';

type OnboardingState = {
  /** `true` cuando la persona terminó o saltó el tutorial. */
  completed: boolean;
  complete: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      complete: () => set({ completed: true }),
    }),
    {
      name: 'rvs.onboarding.v1',
      storage: createJSONStorage(() => kvStorage),
    },
  ),
);
