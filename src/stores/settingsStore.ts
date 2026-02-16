import { DEFAULT_SETTINGS, type AppSettings } from '../data/types';

const STORAGE_KEY = 'mikrobiom-settings';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS };
}

let settings = $state<AppSettings>(loadSettings());

export function getSettingsStore() {
  return {
    get settings() { return settings; },

    update(partial: Partial<AppSettings>) {
      settings = { ...settings, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    },

    reset() {
      settings = { ...DEFAULT_SETTINGS };
      localStorage.removeItem(STORAGE_KEY);
    },
  };
}
