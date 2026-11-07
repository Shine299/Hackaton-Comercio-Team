import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/shared/storage/kv';

/** Colección creada por la persona. «Todos los guardados» es la lista general, no una de estas. */
export type SavedCollection = {
  id: string;
  name: string;
  postIds: string[];
  profileIds: string[];
};

/**
 * Guardados en el teléfono: publicaciones, perfiles y colecciones con nombre.
 * El aviso de cambios es una preferencia local; no hay notificaciones reales todavía.
 */
type SavedState = {
  postIds: string[];
  profileIds: string[];
  collections: SavedCollection[];
  notifyOnChange: boolean;
  isSaved: (postId: string) => boolean;
  isProfileSaved: (profileId: string) => boolean;
  toggle: (postId: string) => void;
  toggleProfile: (profileId: string) => void;
  setNotifyOnChange: (value: boolean) => void;
  createCollection: (name: string) => string | null;
  removeCollection: (id: string) => void;
  togglePostInCollection: (collectionId: string, postId: string) => void;
  toggleProfileInCollection: (collectionId: string, profileId: string) => void;
};

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      postIds: [],
      profileIds: [],
      collections: [],
      notifyOnChange: false,
      isSaved: (postId) => get().postIds.includes(postId),
      isProfileSaved: (profileId) => get().profileIds.includes(profileId),
      toggle: (postId) =>
        set((state) => {
          const exists = state.postIds.includes(postId);
          return {
            postIds: exists ? state.postIds.filter((id) => id !== postId) : [postId, ...state.postIds],
            collections: exists
              ? state.collections.map((collection) => ({
                  ...collection,
                  postIds: collection.postIds.filter((id) => id !== postId),
                }))
              : state.collections,
          };
        }),
      toggleProfile: (profileId) =>
        set((state) => {
          const exists = state.profileIds.includes(profileId);
          return {
            profileIds: exists
              ? state.profileIds.filter((id) => id !== profileId)
              : [profileId, ...state.profileIds],
            collections: exists
              ? state.collections.map((collection) => ({
                  ...collection,
                  profileIds: collection.profileIds.filter((id) => id !== profileId),
                }))
              : state.collections,
          };
        }),
      setNotifyOnChange: (value) => set({ notifyOnChange: value }),
      createCollection: (name) => {
        const trimmed = name.trim();
        if (trimmed.length < 2 || trimmed.length > 30) return null;
        const id = Crypto.randomUUID();
        set((state) => ({
          collections: [...state.collections, { id, name: trimmed, postIds: [], profileIds: [] }],
        }));
        return id;
      },
      removeCollection: (id) =>
        set((state) => ({ collections: state.collections.filter((collection) => collection.id !== id) })),
      togglePostInCollection: (collectionId, postId) =>
        set((state) => ({
          postIds: state.postIds.includes(postId) ? state.postIds : [postId, ...state.postIds],
          collections: state.collections.map((collection) => {
            if (collection.id !== collectionId) return collection;
            const exists = collection.postIds.includes(postId);
            return {
              ...collection,
              postIds: exists
                ? collection.postIds.filter((id) => id !== postId)
                : [postId, ...collection.postIds],
            };
          }),
        })),
      toggleProfileInCollection: (collectionId, profileId) =>
        set((state) => ({
          profileIds: state.profileIds.includes(profileId) ? state.profileIds : [profileId, ...state.profileIds],
          collections: state.collections.map((collection) => {
            if (collection.id !== collectionId) return collection;
            const exists = collection.profileIds.includes(profileId);
            return {
              ...collection,
              profileIds: exists
                ? collection.profileIds.filter((id) => id !== profileId)
                : [profileId, ...collection.profileIds],
            };
          }),
        })),
    }),
    { name: 'rvs.saved.v1', storage: createJSONStorage(() => kvStorage) },
  ),
);
