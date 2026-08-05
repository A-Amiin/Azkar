import azkarData from "@/data/azkar.json";
import type {
  AzkarCollection,
  AzkarData,
  AzkarPeriod,
  Dhikr,
} from "@/types/azkar";

// `resolveJsonModule` inlines this file into the build — Server Components
// read it at build time, so the reading experience needs no runtime fetch
// and works fully offline before the service worker ever gets involved.
const azkar = azkarData as AzkarData;

// Built once at module scope so `getDhikrById` (used by the favorites list)
// is O(1) instead of re-scanning both collections on every lookup.
const dhikrById = new Map<string, Dhikr>(
  [...azkar.morning.items, ...azkar.evening.items].map((dhikr) => [
    dhikr.id,
    dhikr,
  ])
);

export function getMorningAzkar(): AzkarCollection {
  return azkar.morning;
}

export function getEveningAzkar(): AzkarCollection {
  return azkar.evening;
}

export function getAzkarByPeriod(period: AzkarPeriod): AzkarCollection {
  return azkar[period];
}

export function getDhikrById(id: string): Dhikr | undefined {
  return dhikrById.get(id);
}
