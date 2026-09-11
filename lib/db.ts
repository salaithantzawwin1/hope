import { getSupabase } from "./supabase";
import {
  FALLBACK_EVENTS,
  FALLBACK_NEWS,
  FALLBACK_SITE_CONTENT,
} from "./fallback-data";
import type { EventItem, GalleryImage, NewsItem, SiteContentRow } from "./types";

/**
 * Public URL for a stored image.
 *
 * Phase 1 of the Cloudflare migration: images live in R2, exposed through a
 * custom domain on the school's zone (set NEXT_PUBLIC_IMAGE_BASE_URL in
 * .env.local, e.g. https://images.hopeinternationalschool.com).
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
  const supabase = getSupabase();
  if (!supabase) return FALLBACK_NEWS;
  try {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return (data ?? []) as NewsItem[];
  } catch {
    return FALLBACK_NEWS;
  }
}

export async function fetchEvents(): Promise<EventItem[]> {
  const supabase = getSupabase();
  if (!supabase) {
    const today = new Date().toISOString().slice(0, 10);
    return FALLBACK_EVENTS.filter((e) => e.date >= today);
  }
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("date", today)
      .order("date", { ascending: true })
      .limit(20);
    if (error) throw error;
    return (data ?? []) as EventItem[];
  } catch {
    return FALLBACK_EVENTS;
  }
}

export async function fetchGallery(): Promise<GalleryImage[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as GalleryImage[];
  } catch {
    return [];
  }
}

export async function fetchSiteContent(): Promise<Record<string, { en: string; my: string }>> {
  const supabase = getSupabase();
  if (!supabase) return FALLBACK_SITE_CONTENT;
  try {
    const { data, error } = await supabase.from("site_content").select("*");
    if (error) throw error;
    const map: Record<string, { en: string; my: string }> = { ...FALLBACK_SITE_CONTENT };
    for (const row of (data ?? []) as SiteContentRow[]) {
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