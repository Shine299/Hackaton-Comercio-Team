import { createMemoryQueueDb } from './memoryQueueDb';

/** Web (solo para revisar la UI): sin SQLite, la cola vive en memoria. */
export const queueDb = createMemoryQueueDb();
