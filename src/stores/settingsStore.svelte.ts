import { DEFAULT_SETTINGS, type AppSettings } from '../data/types';
import { db } from '../data/db';

const SETTINGS_ID = 'app';
const LEGACY_STORAGE_KEY = 'mikrobiom-settings';

let settings = $state<AppSettings>({ ...DEFAULT_SETTINGS });
let initialized = false;

async function init() {
  if (initialized) return;
  initialized = true;

  // Try loading from IndexedDB first
  const row = await db.settings.get(SETTINGS_ID);
  if (row) {
    settings = { ...DEFAULT_SETTINGS, ...row.value };
    return;
  }

  // Migrate from localStorage if present
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      settings = parsed;
      await db.settings.put({ id: SETTINGS_ID, value: parsed });
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch { /* ignore */ }
}

// Start loading immediately
init();

export function getSettingsStore() {
  return {
    get settings() { return settings; },

    update(partial: Partial<AppSettings>) {
      settings = { ...settings, ...partial };
      db.settings.put({ id: SETTINGS_ID, value: { ...settings } });
    },

    reset() {
      settings = { ...DEFAULT_SETTINGS };
      db.settings.put({ id: SETTINGS_ID, value: { ...DEFAULT_SETTINGS } });
    },
  };
}
