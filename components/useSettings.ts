"use client";

import { useEffect, useState } from "react";
import { fetchSiteContent } from "@/lib/db";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  mergeSettings,
  parseSettings,
  type SiteSettings,
} from "@/lib/settings";

let cache: SiteSettings | null = null;
let cachePromise: Promise<SiteSettings> | null = null;

function load(): Promise<SiteSettings> {
  if (cache) return Promise.resolve(cache);
  if (!cachePromise) {
    cachePromise = fetchSiteContent()
      .then((map) => {
        const parsed = parseSettings(map[SETTINGS_KEY]?.en);
        cache = parsed ?? DEFAULT_SETTINGS;
        return cache;
      })
      .catch(() => DEFAULT_SETTINGS);
  }
  return cachePromise;
}

/**
 * Loads the admin-editable site settings (Settings tab). Returns the
 * built-in defaults until the block has been saved or the API is
 * unreachable — the same graceful-degradation rule as every other block.
 *
 * Several components (Header, Footer, both grade dropdowns, three forms)
 * share one module-level fetch/cache, mirroring SiteText.
 */
export function useSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let active = true;
    load().then((value) => {
      if (active) setSettings(value);
    });
    return () => {
      active = false;
    };
  }, []);

  return settings;
}

/** Direct (non-hook) access for helpers outside React — the merged block. */
export function getSettings(): Promise<SiteSettings> {
  return load();
}

export { mergeSettings };
