import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/shared/storage/kv';

import type { Camera } from './types';

type CamerasState = {
  cameras: Camera[];
  add: (camera: Camera) => void;
  remove: (id: string) => void;
};

/**
 * Cámaras registradas en este teléfono. Todavía no se comparten con el servidor (tabla `cameras`, SPEC-035
 * fase 2): por eso la app las marca como «Solo en este teléfono».
 */
export const useCamerasStore = create<CamerasState>()(
  persist(
    (set) => ({
      cameras: [],
      add: (camera) => set((s) => ({ cameras: [camera, ...s.cameras.filter((c) => c.id !== camera.id)] })),
      remove: (id) => set((s) => ({ cameras: s.cameras.filter((c) => c.id !== id) })),
    }),
    { name: 'rvs.cameras.v1', storage: createJSONStorage(() => kvStorage) },
  ),
);
