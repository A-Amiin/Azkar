/**
 * Domain types for the Azkar content model.
 *
 * These mirror the shape of `data/azkar.json` exactly — see `data/azkar.ts`
 * for the typed accessors that read this data at build time.
 */

export type AzkarCategory = "quran" | "sunnah";

export type AzkarPeriod = "morning" | "evening";

export interface Dhikr {
  id: string;
  category: AzkarCategory;
  text: string;
  count: number;
  hadith: string | null;
}

export interface AzkarCollection {
  title: string;
  source: string;
  items: Dhikr[];
}

export interface AzkarData {
  morning: AzkarCollection;
  evening: AzkarCollection;
}
