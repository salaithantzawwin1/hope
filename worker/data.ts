/**
 * /api/news, /api/events, /api/gallery, /api/content — D1-backed routes
 * (Phase 3). Reads are public; writes require a valid staff session cookie
 * (worker/auth.ts). Response shapes match what lib/db.ts and the admin
 * components consumed from Supabase, so markup and fallback behavior are
 * unchanged.
 */

import { badRequest, requireStaff, unauthorized } from "./auth";
import type { Env } from "./index";

/** Null when the request may proceed, or the 401 Response to return. */
async function writeGuard(
  request: Request,
  env: Env,
): Promise<Response | null> {
  return (await requireStaff(request, env)) ? null : unauthorized();
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function notFound(): Response {
  return json({ error: "not_found" }, 404);
}

function methodNotAllowed(allow: string): Response {
  return new Response(JSON.stringify({ error: "method_not_allowed" }), {
    status: 405,
    headers: { allow },
  });
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optStr(value: unknown): string | null {
  const s = str(value);
  return s ? s : null;
}

function nowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** Rows come back from D1 matching the site's existing item types. */
interface NewsRow {
  id: string;
  title_en: string;
  title_my: string;
  body_en: string;
  body_my: string;
  image_url: string | null;
  published_at: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

export async function handleNews(
  request: Request,
  env: Env,
): Promise<Response> {
  const db = env.DB;

  if (request.method === "GET") {
    const { results } = await db
      .prepare(
        "select * from news order by published_at desc, created_at desc limit 50",
      )
      .all<NewsRow>();
    return json({ items: results });
  }

  const authFailure = await writeGuard(request, env);
  if (authFailure) return authFailure;

  if (request.method === "POST") {
    const body = await readJson(request);
    if (!body) return badRequest("Expected a JSON body");
    const title_en = str(body.title_en);
    if (!title_en) return badRequest("title_en is required");
    const id = crypto.randomUUID();
    await db
      .prepare(
        "insert into news (id, title_en, title_my, body_en, body_my, image_url, published_at) values (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
      )
      .bind(
        id,
        title_en,
        str(body.title_my),
        str(body.body_en),
        str(body.body_my),
        optStr(body.image_url),
        str(body.published_at) || nowIso(),
      )
      .run();
    return json({ id }, 201);
  }

  if (request.method === "PUT") {
    const body = await readJson(request);
    if (!body) return badRequest("Expected a JSON body");
    const id = str(body.id);
    if (!id) return badRequest("id is required");
    const title_en = str(body.title_en);
    if (!title_en) return badRequest("title_en is required");
    const { meta } = await db
      .prepare(
        "update news set title_en=?1, title_my=?2, body_en=?3, body_my=?4, image_url=?5, published_at=?6 where id=?7",
      )
      .bind(
        title_en,
        str(body.title_my),
        str(body.body_en),
        str(body.body_my),
        optStr(body.image_url),
        str(body.published_at) || nowIso(),
        id,
      )
      .run();
    if (meta.changes === 0) return notFound();
    return json({ id });
  }

  if (request.method === "DELETE") {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return badRequest("Missing ?id=");
    const { meta } = await db
      .prepare("delete from news where id=?1")
      .bind(id)
      .run();
    if (meta.changes === 0) return notFound();
    return json({ deleted: id });
  }

  return methodNotAllowed("GET, POST, PUT, DELETE");
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export async function handleEvents(
  request: Request,
  env: Env,
): Promise<Response> {
  const db = env.DB;

  if (request.method === "GET") {
    const { results } = await db
      .prepare("select * from events order by date asc limit 100")
      .all<Record<string, unknown>>();
    return json({ items: results });
  }

  const authFailure = await writeGuard(request, env);
  if (authFailure) return authFailure;

  if (request.method === "POST") {
    const body = await readJson(request);
    if (!body) return badRequest("Expected a JSON body");
    const title_en = str(body.title_en);
    const date = str(body.date);
    if (!title_en) return badRequest("title_en is required");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return badRequest("date must be YYYY-MM-DD");
    }
    const id = crypto.randomUUID();
    await db
      .prepare(
        "insert into events (id, title_en, title_my, date, time, location_en, location_my, description_en, description_my, image_url) values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
      )
      .bind(
        id,
        title_en,
        str(body.title_my),
        date,
        optStr(body.time),
        optStr(body.location_en),
        optStr(body.location_my),
        optStr(body.description_en),
        optStr(body.description_my),
        optStr(body.image_url),
      )
      .run();
    return json({ id }, 201);
  }

  if (request.method === "PUT") {
    const body = await readJson(request);
    if (!body) return badRequest("Expected a JSON body");
    const id = str(body.id);
    const title_en = str(body.title_en);
    const date = str(body.date);
    if (!id) return badRequest("id is required");
    if (!title_en) return badRequest("title_en is required");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return badRequest("date must be YYYY-MM-DD");
    }
    const { meta } = await db
      .prepare(
        "update events set title_en=?1, title_my=?2, date=?3, time=?4, location_en=?5, location_my=?6, description_en=?7, description_my=?8, image_url=?9 where id=?10",
      )
      .bind(
        title_en,
        str(body.title_my),
        date,
        optStr(body.time),
        optStr(body.location_en),
        optStr(body.location_my),
        optStr(body.description_en),
        optStr(body.description_my),
        optStr(body.image_url),
        id,
      )
      .run();
    if (meta.changes === 0) return notFound();
    return json({ id });
  }

  if (request.method === "DELETE") {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return badRequest("Missing ?id=");
    const { meta } = await db
      .prepare("delete from events where id=?1")
      .bind(id)
      .run();
    if (meta.changes === 0) return notFound();
    return json({ deleted: id });
  }

  return methodNotAllowed("GET, POST, PUT, DELETE");
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

export async function handleGallery(
  request: Request,
  env: Env,
): Promise<Response> {
  const db = env.DB;

  if (request.method === "GET") {
    const { results } = await db
      .prepare("select * from gallery order by created_at desc limit 100")
      .all<Record<string, unknown>>();
    return json({ items: results });
  }

  const authFailure = await writeGuard(request, env);
  if (authFailure) return authFailure;

  if (request.method === "POST") {
    const body = await readJson(request);
    if (!body) return badRequest("Expected a JSON body");
    const image_url = str(body.image_url);
    if (!image_url) return badRequest("image_url is required");
    const id = crypto.randomUUID();
    await db
      .prepare(
        "insert into gallery (id, image_url, caption_en, caption_my, album_en, album_my, album_desc_en, album_desc_my) values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
      )
      .bind(
        id,
        image_url,
        optStr(body.caption_en),
        optStr(body.caption_my),
        optStr(body.album_en),
        optStr(body.album_my),
        optStr(body.album_desc_en),
        optStr(body.album_desc_my),
      )
      .run();
    return json({ id }, 201);
  }

  // PATCH updates captions/album text for one photo or a batch of ids.
  if (request.method === "PATCH") {
    const body = await readJson(request);
    if (!body) return badRequest("Expected a JSON body");
    const ids = normalizeIds(body.ids ?? body.id);
    if (ids.length === 0) return badRequest("id or ids is required");
    const sets: string[] = [];
    const values: (string | null)[] = [];
    for (const field of [
      "caption_en",
      "caption_my",
      "album_en",
      "album_my",
      "album_desc_en",
      "album_desc_my",
    ] as const) {
      if (field in body) {
        sets.push(`${field}=?`);
        values.push(optStr(body[field]));
      }
    }
    if (sets.length === 0) return badRequest("No fields to update");
    const placeholders = ids.map(() => "?").join(",");
    const { meta } = await db
      .prepare(
        `update gallery set ${sets.join(", ")} where id in (${placeholders})`,
      )
      .bind(...values, ...ids)
      .run();
    return json({ updated: meta.changes });
  }

  if (request.method === "DELETE") {
    const ids = normalizeIds(
      new URL(request.url).searchParams.get("ids") ??
        new URL(request.url).searchParams.get("id"),
    );
    if (ids.length === 0) return badRequest("Missing ?id= or ?ids=");
    const placeholders = ids.map(() => "?").join(",");
    const { meta } = await db
      .prepare(`delete from gallery where id in (${placeholders})`)
      .bind(...ids)
      .run();
    if (meta.changes === 0) return notFound();
    return json({ deleted: meta.changes });
  }

  return methodNotAllowed("GET, POST, PATCH, DELETE");
}

/** Accepts one id or an array of ids; keeps only non-empty strings. */
function normalizeIds(value: unknown): string[] {
  const raw = Array.isArray(value) ? value : value != null ? [value] : [];
  return raw
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => v.trim());
}

// ---------------------------------------------------------------------------
// Site content (key/value rows; JSON page sections are plain rows too)
// ---------------------------------------------------------------------------

export async function handleContent(
  request: Request,
  env: Env,
): Promise<Response> {
  const db = env.DB;

  if (request.method === "GET") {
    const { results } = await db
      .prepare("select * from site_content order by key asc")
      .all<Record<string, unknown>>();
    return json({ items: results });
  }

  const authFailure = await writeGuard(request, env);
  if (authFailure) return authFailure;

  if (request.method === "PUT") {
    const body = await readJson(request);
    if (!body) return badRequest("Expected a JSON body");
    // Accept {rows:[...]}, {rows:{...}} (legacy admin build), or a bare
    // {...} row object — normalize everything to an array of rows.
    const rawRows = Array.isArray(body.rows)
      ? body.rows
      : body.rows !== undefined && typeof body.rows === "object"
        ? [body.rows]
        : [body];
    const clean = rawRows
      .map((row) => row as Record<string, unknown>)
      .filter((row) => str(row.key))
      .map((row) => ({
        key: str(row.key),
        value_en: typeof row.value_en === "string" ? row.value_en : "",
        value_my: typeof row.value_my === "string" ? row.value_my : "",
      }));
    if (clean.length === 0) return badRequest("key is required");
    for (const row of clean) {
      await db
        .prepare(
          "insert into site_content (key, value_en, value_my, updated_at) values (?1, ?2, ?3, ?4) " +
            "on conflict(key) do update set value_en=?2, value_my=?3, updated_at=?4",
        )
        .bind(row.key, row.value_en, row.value_my, nowIso())
        .run();
    }
    return json({ saved: clean.length });
  }

  return methodNotAllowed("GET, PUT");
}
