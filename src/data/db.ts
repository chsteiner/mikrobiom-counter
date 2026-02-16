import Dexie, { type Table } from 'dexie';
import type { PlantEntry, AppSettings } from './types';

interface SettingsRow {
  id: string;
  value: AppSettings;
}

class MikrobiomDB extends Dexie {
  entries!: Table<PlantEntry>;
  settings!: Table<SettingsRow>;

  constructor() {
    super('mikrobiom-counter');
    this.version(1).stores({
      entries: '++id, plantId, weekKey, timestamp',
    });
    this.version(2).stores({
      entries: '++id, plantId, weekKey, timestamp',
      settings: 'id',
    });
  }
}

export const db = new MikrobiomDB();
