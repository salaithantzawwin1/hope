import { apiEvents, apiGallery, apiNews, apiSiteContent } from "./api";
import {
  FALLBACK_EVENTS,
  FALLBACK_NEWS,
  FALLBACK_SITE_CONTENT,
} from "./fallback-data";
import type { EventItem, GalleryImage, NewsItem } from "./types";

/**
 * Public URL for a stored image.
 *
 * Images live in R2, exposed through a custom domain on the school's zone
 * (set NEXT_PUBLIC_IMAGE_BASE_URL in .env.local, e.g.
 * https://images.hopeinternationalschool.com).
 *
 * Pass-through cases (returned unchanged):
 *  - absolute URLs (older Supabase URLs keep working until the data migration
 *    rewrites them — see plan §4, and the Supabase bucket stays up as rollback)
 *  - root-relative paths (static assets shipped in /public, e.g. /Bunner/…)
 * Everything else is treated as a bare R2 key and prefixed with the base URL;
 * without a configured base URL the key itself is returned.
 */
export function publicImageUrl(path: string): string {
  if (
    !path ||
    path.startsWith("/") ||
    /^(https?:)?\/\//i.test(path) ||
    /^(data|blob):/i.test(path)
  ) {
    return path;
  }
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL?.replace(/\/+$/, "");
  return base ? `${base}/${path}` : path;
}

export async function fetchNews(): Promise<NewsItem[]> {
  try {
    return await apiNews();
  } catch {
    return FALLBACK_NEWS;
  }
}

export async function fetchEvents(): Promise<EventItem[]> {
  try {
    return await apiEvents();
  } catch {
    const today = new Date().toISOString().slice(0, 10);
    return FALLBACK_EVENTS.filter((e) => e.date >= today);
  }
}

export async function fetchGallery(): Promise<GalleryImage[]> {
  try {
    return await apiGallery();
  } catch {
    return [];
  }
}

export async function fetchSiteContent(): Promise<Record<string, { en: string; my: string }>> {
  try {
    const rows = await apiSiteContent();
    const map: Record<string, { en: string; my: string }> = { ...FALLBACK_SITE_CONTENT };
    for (const row of rows) {
      map[row.key] = { en: row.value_en, my: row.value_my };
    }
    return map;
  } catch {
    return FALLBACK_SITE_CONTENT;
  }
}

/** Grade levels used by the inquiry form (same list as the fees table). */
export const GRADE_LEVELS = [
  "Early Years",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];
