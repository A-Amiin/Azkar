"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS, type FavoritesSchemaV1 } from "@/lib/storage";

// Module-scope constant so it's referentially stable across renders — the
// storage snapshot cache keys off the raw localStorage string, but the
// fallback identity matters the first time a key has never been written.
const EMPTY_FAVORITES: FavoritesSchemaV1 = { version: 1, ids: [] };

interface UseFavoritesResult {
  ids: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

/** Cross-route favorites state (used by /morning, /evening, and /favorites),
 *  persisted as a plain array of dhikr ids — never the full dhikr content,
 *  which always comes from `data/azkar.ts` by id. */
export function useFavorites(): UseFavoritesResult {
  const [state, setState] = useLocalStorage(
    STORAGE_KEYS.favorites,
    EMPTY_FAVORITES
  );

  const idSet = useMemo(() => new Set(state.ids), [state.ids]);

  const isFavorite = useCallback((id: string) => idSet.has(id), [idSet]);

  const toggleFavorite = useCallback(
    (id: string) => {
      setState((previous) => {
        const next = new Set(previous.ids);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return { version: 1, ids: Array.from(next) };
      });
    },
    [setState]
  );

  return { ids: state.ids, isFavorite, toggleFavorite };
}
