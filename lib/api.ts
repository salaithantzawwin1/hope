/**
 * Typed fetch wrappers around the Worker's same-origin API (Phase 3).
 *
 * lib/db.ts delegates its public fetchers here, keeping their signatures
 * unchanged — so NewsEventsPage, Gallery, FeaturedEvent, etc. need zero
 * changes. Mutators replace the ~10 direct `supabase.from(...)` call sites
 * in the admin components.
 *
 * Public fetchers keep the site's graceful-degradation behavior: if the API
 * is unreachable they return the caller-provided fallback (same as today
 * when Supabase env vars are missing).
 */

import type {
  EventItem,
  GalleryImage,
  NewsItem,
  SiteContentRow,
} from "./types";

// ---------------------------------------------------------------------------
// Low-level helpers
// ---------------------------------------------------------------------------

class ApiError extends Error {}

async function parseError(response: Response): Promise<never> {
  const message = await response
    .json()
    .then((body) => (body as { message?: string }).message)
    .catch(() => undefined);
  throw new ApiError(message ?? `Request failed (${response.status})`);
}

async function requestJson<T>(response: Response): Promise<T> {
  if (!response.ok) await parseError(response);
  return (await response.json()) as T;
}

async function getJson<T>(path: string): Promise<T> {
  return requestJson<T>(await fetch(path, { credentials: "same-origin" }));
}

/** JSON write with cookie auth; throws ApiError with the server message. */
export async function apiWrite<T = unknown>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const response = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return requestJson<T>(response);
}

function withQuery(path: string, params: Record<string, string | string[]>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const v of Array.isArray(value) ? value : [value]) {
      search.append(key, v);
    }
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

// ---------------------------------------------------------------------------
// Session (passphrase auth) — see worker/auth.ts
// ---------------------------------------------------------------------------

/** Exchange the staff passphrase for a signed session cookie. */
export async function login(passphrase: string): Promise<void> {
  await apiWrite("/api/auth/login", "POST", { passphrase });
}

export async function logout(): Promise<void> {
  await apiWrite("/api/auth/logout", "POST").catch(() => undefined);
}

export async function checkAuth(): Promise<boolean> {
  try {
    const { authed } = await getJson<{ authed: boolean }>("/api/auth/check");
    return authed;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Public reads (with the site's graceful-degradation contract)
// ---------------------------------------------------------------------------

interface ListResponse<T> {
  items: T[];
}

export async function apiNews(): Promise<NewsItem[]> {
  const { items } = await getJson<ListResponse<NewsItem>>("/api/news");
  return items;
}

export async function apiEvents(): Promise<EventItem[]> {
  const { items } = await getJson<ListResponse<EventItem>>("/api/events");
  return items;
}

export async function apiGallery(): Promise<GalleryImage[]> {
  const { items } = await getJson<ListResponse<GalleryImage>>("/api/gallery");
  return items;
}

export async function apiSiteContent(): Promise<SiteContentRow[]> {
  const { items } = await getJson<ListResponse<SiteContentRow>>("/api/content");
  return items;
}

// ---------------------------------------------------------------------------
// Admin mutators
// ---------------------------------------------------------------------------

export interface NewsInput {
  title_en: string;
  title_my: string;
  body_en: string;
  body_my: string;
  image_url: string | null;
  published_at: string;
}

export const newsApi = {
  create: (input: NewsInput) => apiWrite<{ id: string }>("/api/news", "POST", input),
  update: (id: string, input: NewsInput) =>
    apiWrite<{ id: string }>("/api/news", "PUT", { id, ...input }),
  remove: (id: string) =>
    apiWrite<{ deleted: string }>(`/api/news?id=${encodeURIComponent(id)}`, "DELETE"),
};

export interface EventInput {
  title_en: string;
  title_my: string;
  date: string;
  time: string | null;
  location_en: string | null;
  location_my: string | null;
  description_en: string | null;
  description_my: string | null;
  image_url: string | null;
}

export const eventsApi = {
  create: (input: EventInput) => apiWrite<{ id: string }>("/api/events", "POST", input),
  update: (id: string, input: EventInput) =>
    apiWrite<{ id: string }>("/api/events", "PUT", { id, ...input }),
  remove: (id: string) =>
    apiWrite<{ deleted: string }>(`/api/events?id=${encodeURIComponent(id)}`, "DELETE"),
};

export interface GalleryInput {
  image_url: string;
  caption_en: string | null;
  caption_my: string | null;
  album_en: string | null;
  album_my: string | null;
  album_desc_en: string | null;
  album_desc_my: string | null;
}

export const galleryApi = {
  create: (input: GalleryInput) =>
    apiWrite<{ id: string }>("/api/gallery", "POST", input),
  /** Update caption/album fields for one photo or a batch of ids. */
  update: (
    ids: string | string[],
    fields: Partial<
      Pick<GalleryInput, "caption_en" | "caption_my" | "album_en" | "album_my" | "album_desc_en" | "album_desc_my">
    >,
  ) =>
    apiWrite<{ updated: number }>(
      "/api/gallery",
      "PATCH",
      typeof ids === "string" ? { id: ids, ...fields } : { ids, ...fields },
    ),
  remove: (ids: string | string[]) =>
    apiWrite<{ deleted: number }>(
      withQuery("/api/gallery", { [typeof ids === "string" ? "id" : "ids"]: ids }),
      "DELETE",
    ),
};

export const contentApi = {
  /** Upsert one or several site_content rows (admin editors). */
  save: (
    rows:
      | { key: string; value_en: string; value_my: string }
      | { key: string; value_en: string; value_my: string }[],
  ) => apiWrite<{ saved: number }>("/api/content", "PUT", { rows }),
};
