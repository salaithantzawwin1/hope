"use client";

import { useEffect, useState } from "react";
import { fetchSiteContent } from "@/lib/db";
import { FALLBACK_PAGE_HEADINGS } from "@/lib/fallback-data";
import type { PageHeadings } from "@/lib/types";

const KEY = "page_headings";

function parseJson<T>(raw: string | undefined): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

let cache: PageHeadings | null = null;
let cachePromise: Promise<PageHeadings> | null = null;

function load(): Promise<PageHeadings> {
  if (cache) return Promise.resolve(cache);
  if (!cachePromise) {
    cachePromise = fetchSiteContent()
      .then((map) => {
        const parsed = parseJson<Partial<PageHeadings>>(map[KEY]?.en);
        cache = { ...FALLBACK_PAGE_HEADINGS, ...(parsed ?? {}) };
        return cache;
      })
      .catch(() => FALLBACK_PAGE_HEADINGS);
  }
  return cachePromise;
}

/**
 * Loads the admin-editable page headings block (Settings → Page Headings).
 * Returns null while loading so callers can render the message-catalog
 * default immediately and swap when the block arrives (no flash either way).
 */
export function usePageHeadings(): PageHeadings | null {
  const [data, setData] = useState<PageHeadings | null>(cache);
  useEffect(() => {
    let active = true;
    load().then((value) => {
      if (active) setData(value);
    });
    return () => {
      active = false;
    };
  }, []);
  return data;
}

/**
 * Picks the localized editable value with catalog fallback:
 * saved MY → saved EN → catalog value for the active locale.
 */
export function pickHeading(
  block: PageHeadings | null,
  locale: string,
  enKey: keyof PageHeadings,
  myKey: keyof PageHeadings,
  fallback: string,
): string {
  const savedEn = block?.[enKey] ?? "";
  const savedMy = block?.[myKey] ?? "";
  if (locale === "my" && savedMy.trim()) return savedMy;
  if (savedEn.trim()) return savedEn;
  return fallback;
}
