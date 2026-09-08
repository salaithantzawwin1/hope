import { getSupabase } from "./supabase";
import {
  FALLBACK_EVENTS,
  FALLBACK_NEWS,
  FALLBACK_SITE_CONTENT,
} from "./fallback-data";
import type { EventItem, GalleryImage, NewsItem, SiteContentRow } from "./types";

/** Public URL for an image stored in the "images" bucket. */
export function publicImageUrl(supabaseUrl: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/images/${path}`;
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
  if (!supabase) return FALLBACK_EVENTS;
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