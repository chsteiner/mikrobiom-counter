import { db } from '../data/db';
import { PLANTS } from '../data/plants';
import type { PlantEntry } from '../data/types';

export async function exportJSON(): Promise<void> {
  const entries = await db.entries.toArray();
  const data = {
    version: 1,
    exportDate: new Date().toISOString(),
    entries,
  };
  downloadFile(
    JSON.stringify(data, null, 2),
    `mikrobiom-export-${formatDate()}.json`,
    'application/json'
  );
}

export async function exportCSV(): Promise<void> {
  const entries = await db.entries.toArray();
  const header = 'Datum,Pflanze,Kategorie,Kalenderwoche,Eingabeart';
  const rows = entries.map(e => {
    const plant = PLANTS.find(p => p.id === e.plantId);
    const cat = plant?.category ?? '';
    const date = new Date(e.timestamp).toLocaleString('de-DE');
    return `${date},${e.plantName},${cat},${e.weekKey},${e.source}`;
  });
  downloadFile(
    [header, ...rows].join('\n'),
    `mikrobiom-export-${formatDate()}.csv`,
    'text/csv'
  );
}

export async function importJSON(file: File): Promise<number> {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!data.entries || !Array.isArray(data.entries)) {
    throw new Error('Ungültiges Exportformat');
  }
  const entries: PlantEntry[] = data.entries.map((e: PlantEntry) => ({
    plantId: e.plantId,
    plantName: e.plantName,
    weekKey: e.weekKey,
    timestamp: e.timestamp,
    source: e.source,
  }));
  await db.entries.bulkAdd(entries);
  return entries.length;
}

export async function clearAllData(): Promise<void> {
  await db.entries.clear();
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(): string {
  return new Date().toISOString().slice(0, 10);
}
