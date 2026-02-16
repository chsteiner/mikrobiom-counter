export type PlantCategory =
  | 'gemuese'
  | 'obst'
  | 'nuesse'
  | 'samen'
  | 'huelsenfruechte'
  | 'getreide'
  | 'kraeuter'
  | 'gewuerze';

export const CATEGORY_LABELS: Record<PlantCategory, string> = {
  gemuese: 'Gemüse',
  obst: 'Obst',
  nuesse: 'Nüsse',
  samen: 'Samen',
  huelsenfruechte: 'Hülsenfrüchte',
  getreide: 'Getreide',
  kraeuter: 'Kräuter',
  gewuerze: 'Gewürze',
};

export interface Plant {
  id: string;
  name: string;
  category: PlantCategory;
  aliases: string[];
}

export interface PlantEntry {
  id?: number;
  plantId: string;
  plantName: string;
  weekKey: string;
  timestamp: number;
  source: 'voice' | 'manual';
}

export interface WeekSummary {
  weekKey: string;
  uniquePlants: string[];
  count: number;
  goal: number;
  entries: PlantEntry[];
}

export interface AppSettings {
  weeklyGoal: number;
  streakThreshold: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  weeklyGoal: 30,
  streakThreshold: 20,
};
