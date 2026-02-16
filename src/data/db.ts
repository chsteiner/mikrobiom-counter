import Dexie, { type Table } from 'dexie';
import type { PlantEntry } from './types';

class MikrobiomDB extends Dexie {
  entries!: Table<PlantEntry>;

  constructor() {
    super('mikrobiom-counter');
    this.version(1).stores({
      entries: '++id, plantId, weekKey, timestamp',
    });
  }
}

export const db = new MikrobiomDB();
