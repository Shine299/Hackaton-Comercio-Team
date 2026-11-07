import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { SyncStatus } from '@/shared/sync/status';
import { kvStorage } from '@/shared/storage/kv';

export const REPORT_REASONS = [
  { id: 'inappropriate', label: 'Contenido inadecuado' },
  { id: 'scam', label: 'Sospecha de estafa' },
  { id: 'false', label: 'Información falsa' },
  { id: 'duplicate', label: 'Publicación duplicada' },
  { id: 'other', label: 'Otro motivo' },
] as const;

export type ReportReasonId = (typeof REPORT_REASONS)[number]['id'];

export type PostReport = {
  id: string;
  postId: string;
  reason: ReportReasonId;
  note: string;
  createdAt: number;
  syncStatus: SyncStatus;
};

type ReportState = {
  reports: PostReport[];
  hasReported: (postId: string) => boolean;
  add: (postId: string, reason: ReportReasonId, note: string) => PostReport;
  /** Estado de envío por publicación, según la cola o el servidor. */
  setSyncStatus: (statuses: Record<string, SyncStatus>) => void;
};

/** Reportes locales. No se envían a nadie hasta que exista servidor y moderación. */
export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: [],
      hasReported: (postId) => get().reports.some((r) => r.postId === postId),
      add: (postId, reason, note) => {
        const existing = get().reports.find((r) => r.postId === postId);
        if (existing) return existing;
        const item: PostReport = {
          id: Crypto.randomUUID(),
          postId,
          reason,
          note: note.trim(),
          createdAt: Date.now(),
          syncStatus: 'local',
        };
        set((state) => ({ reports: [item, ...state.reports] }));
        return item;
      },
      setSyncStatus: (statuses) =>
        set((state) => ({
          reports: state.reports.map((r) => (statuses[r.postId] ? { ...r, syncStatus: statuses[r.postId] } : r)),
        })),
    }),
    { name: 'rvs.post-reports.v1', storage: createJSONStorage(() => kvStorage) },
  ),
);
