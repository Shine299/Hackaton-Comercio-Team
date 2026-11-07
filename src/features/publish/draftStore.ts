import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/shared/storage/kv';

import { EMPTY_PUBLISH, type PublishFormValues } from './schema';

type DraftState = PublishFormValues & {
  save: (values: PublishFormValues) => void;
  clear: () => void;
  hasContent: () => boolean;
};

function hasContent(values: PublishFormValues): boolean {
  return Boolean(values.kind || values.category || values.title.trim() || values.description.trim() || values.photoUri);
}

/** Borrador automático de la publicación en curso. Vive solo en el teléfono. */
export const usePublishDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      ...EMPTY_PUBLISH,
      save: (values) => set({ ...values }),
      clear: () => set({ ...EMPTY_PUBLISH }),
      hasContent: () => hasContent(get()),
    }),
    {
      name: 'rvs.publish-draft.v1',
      storage: createJSONStorage(() => kvStorage),
      partialize: (state) => {
        const { save: _s, clear: _c, hasContent: _h, ...values } = state;
        return values;
      },
    },
  ),
);
