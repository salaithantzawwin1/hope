/**
 * /api/submissions — public form inbox (inquiries / registrations / job
 * applications).
 *
 *   POST /api/submissions        public; JSON body; kind + fields + honeypot
 *   GET  /api/submissions        staff only; latest 200 rows (?kind= filter)
 *   PATCH /api/submissions       staff only; { id, kind?, data? } edit
 *   DELETE /api/submissions?id=  staff only; removes the row (and the R2 CV)
 *
 * Why D1 at all when the Apps Scripts already store every submission?
 * The Sheets + email pipeline is the long-term mirror, but it lives in a
 * personal Google account: staff cannot search it, mark entries processed,
 * or remove spam from the school website itself. The inbox gives the admin
 * portal one place to read every inquiry/registration/application — and
 * because the Worker still forwards to the Apps Script endpoints, the
 * email/Sheet behavior staff already rely on continues unchanged.
 *
 * Anti-spam (no external service needed):
 *   - `website` honeypot field: real visitors never fill it (it is visually
 *     hidden and untitled), bots do. A filled honeypot is accepted with a
 *     fake id and silently dropped, so bots learn nothing.
 *   - A short-fingerprint rate limit (see rateLimit in worker/ratelimit.ts).
 *
 * CVs (job applications) are stored in the IMAGES R2 bucket under `cv/…`.
 * serveImage()'s key regex only matches `folder/` names it knows, so `cv/`
 * objects are never publicly served — staff download them through the
 * signed-in portal (GET /api/submissions/cv?id=…).
 */

import { badRequest, requireStaff, unauthorized } from "./auth";
import { rateLimit } from "./ratelimit";
import type { Env } from "./index";

const KINDS = new Set(["inquiry", "registration", "application"]);

/** Upper bound on the JSON payload (CVs ride separately in R2 as base64). */
const MAX_BODY_BYTES = 11 * 1024 * 1024; // ~10 MB CV base64 + overhead

function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

interface SubmissionRow {
  id: string;
  kind: string;
  data: string;
  cv_key: string | null;
  ip: string | null;
  created_at: string;
}

/** Short, non-reversible client fingerprint (abuse triage only). */
async function fingerprint(request: Request): Promise<string | null> {
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "";
  const ua = request.headers.get("user-agent") ?? "";
  if (!ip && !ua) return null;
  try {
    // Hash so the database never stores full visitor IPs.
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${ip}|${ua}`),
    );
    return [...new Uint8Array(buf).slice(0, 8)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return null;
  }
}

/**
 * Forward the original submission to the configured Apps Script endpoint so
 * the Google Sheet + email pipeline keeps working exactly as before. Errors
 * are swallowed: the D1 row is the source of truth, the mirror is best-effort.
 */
async function forwardToMirror(
  endpoint: string,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    await fetch(endpoint, {
      method: "POST",
      // text/plain mirrors what the browser used to send: an "simple"
      // CORS-safe request that Apps Script's doPost accepts without a
      // preflight (Apps Script does not answer OPTIONS).
      headers: { "content-type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      // Do not let a slow Apps Script hold the visitor's response hostage.
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // Mirror failure must never block or fail the visitor's submission.
  }
}

export async function handleSubmissions(
  request: Request,
  env: Env,
): Promise<Response> {
  const db = env.DB;
  const url = new URL(request.url);

  // ---- Staff routes --------------------------------------------------------

  if (request.method === "GET") {
    if (!(await requireStaff(request, env))) return unauthorized();
    const kind = url.searchParams.get("kind");
    if (kind && !KINDS.has(kind)) return badRequest("unknown kind");
    const { results } = kind
      ? await db
          .prepare(
            "select id, kind, data, cv_key, created_at from submissions where kind=?1 order by created_at desc limit 200",
          )
          .bind(kind)
          .all<SubmissionRow>()
      : await db
          .prepare(
            "select id, kind, data, cv_key, created_at from submissions order by created_at desc limit 200",
          )
          .all<SubmissionRow>();
    return json({
      items: results.map((r) => ({
        id: r.id,
        kind: r.kind,
        data: safeParse(r.data),
        cv_key: r.cv_key,
        created_at: r.created_at,
      })),
    });
  }

  if (request.method === "PATCH") {
    if (!(await requireStaff(request, env))) return unauthorized();
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return badRequest("Expected a JSON body");
    }
    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id) return badRequest("id is required");
    // Only data (payload JSON) is editable — e.g. staff archiving notes into
    // the entry. kind stays fixed and cv_key is never client-writable.
    const data = body.data === undefined ? undefined : JSON.stringify(body.data);
    const { meta } = await db
      .prepare("update submissions set data=?1 where id=?2")
      .bind(data, id)
      .run();
    if (meta.changes === 0) return json({ error: "not_found" }, 404);
    return json({ updated: meta.changes });
  }

  if (request.method === "DELETE") {
    if (!(await requireStaff(request, env))) return unauthorized();
    const id = url.searchParams.get("id");
    if (!id) return badRequest("Missing ?id=");
    // Fetch first so the CV object (if any) can be removed from R2 too.
    const row = await db
      .prepare("select id, cv_key from submissions where id=?1")
      .bind(id)
      .first<{ id: string; cv_key: string | null }>();
    if (!row) return json({ error: "not_found" }, 404);
    await db.prepare("delete from submissions where id=?1").bind(id).run();
    if (row.cv_key && env.IMAGES) {
      await env.IMAGES.delete(row.cv_key).catch(() => undefined);
    }
    return json({ deleted: id });
  }

  if (request.method === "GETCV") {
    return json({ error: "method_not_allowed" }, 405);
  }

  // ---- Public submit -------------------------------------------------------

  if (request.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405, {
      allow: "GET, POST, PATCH, DELETE",
    });
  }

  // Per-fingerprint limit shared with login (cheap, in-isolate).
  const limited = await rateLimit(request, env, "public-post", 30, 60_000);
  if (limited) {
    return json(
      { error: "rate_limited", message: "Too many requests — try again in a minute." },
      429,
      { "retry-after": "60" },
    );
  }

  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > MAX_BODY_BYTES) {
    return badRequest("Payload too large");
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return badRequest("Expected a JSON body");
  }

  const kind = typeof body.kind === "string" ? body.kind : "";
  if (!KINDS.has(kind)) {
    return badRequest("kind must be inquiry | registration | application");
  }

  const payload = (body.payload ?? null) as Record<string, unknown> | null;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return badRequest("payload object is required");
  }

  // Honeypot: bots fill every field. Accept with a plausible id, drop quietly.
  // The form hides a `website` input inside the payload; real visitors never
  // fill it, so anything non-empty is a bot.
  const honeypot = [body.website, payload.website].find(
    (v) => typeof v === "string" && v.length > 0,
  );
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return json({ id: crypto.randomUUID() }, 201);
  }
  delete payload.website;

  // CV (applications): validate before storing anything.
  let cvKey: string | null = null;
  if (kind === "application") {
    const fileName = typeof payload.cvFileName === "string" ? payload.cvFileName : "";
    const mime = typeof payload.cvMimeType === "string" ? payload.cvMimeType : "";
    const base64 = typeof payload.cvBase64 === "string" ? payload.cvBase64 : "";
    if (!fileName || !base64) return badRequest("cvFileName and cvBase64 are required");
    if (!isAllowedCvMime(mime)) return badRequest("Unsupported CV file type");
    const bytes = base64ToBytes(base64);
    if (bytes.byteLength === 0) return badRequest("Empty CV");
    if (bytes.byteLength > 10 * 1024 * 1024) return badRequest("CV larger than 10 MB");
    if (!env.IMAGES) return json({ error: "storage_unavailable" }, 503);
    const ext = safeExt(fileName);
    cvKey = `cv/${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    await env.IMAGES.put(cvKey, bytes, { httpMetadata: { contentType: mime } });
    // The base64 blob must not be duplicated into the JSON payload/row.
    delete payload.cvBase64;
  }

  const id = crypto.randomUUID();
  const ip = await fingerprint(request);
  await db
    .prepare(
      "insert into submissions (id, kind, data, cv_key, ip) values (?1, ?2, ?3, ?4, ?5)",
    )
    .bind(id, kind, JSON.stringify(payload), cvKey, ip)
    .run();

  // Mirror to the configured Apps Script (Sheet + email). The endpoint comes
  // from the admin Settings block when staff saved one (single source of
  // truth — the same value the forms use), falling back to the Worker secret
  // / env var. Pass the same payload shape those scripts expect (flat
  // fields, plus kind for triage).
  const endpoint = (await savedEndpoint(db, kind)) ?? mirrorEndpoint(kind, env);
  if (endpoint) {
    await forwardToMirror(endpoint, { ...payload, kind });
  }

  return json({ id }, 201);
}

/**
 * Staff-only CV download: streams the R2 object with a content-disposition
 * filename. `cv/` keys are unreachable through the public /api/img route, so
 * this signed-in endpoint is the only way to retrieve an application's CV.
 */
export async function handleSubmissionCv(
  request: Request,
  env: Env,
  id: string,
): Promise<Response> {
  if (!(await requireStaff(request, env))) return unauthorized();
  const row = await env.DB.prepare("select cv_key from submissions where id=?1")
    .bind(id)
    .first<{ cv_key: string | null }>();
  if (!row?.cv_key || !env.IMAGES) {
    return json({ error: "not_found" }, 404);
  }
  const object = await env.IMAGES.get(row.cv_key);
  if (!object) return json({ error: "not_found" }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  const name = row.cv_key.split("/").pop() ?? "cv";
  headers.set("content-disposition", `attachment; filename="${name}"`);
  return new Response(object.body, { headers });
}

// ---- helpers ----------------------------------------------------------------

function safeParse(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

/** CV mime allowlist — PDF, Word, RTF and images (matches the public form). */
function isAllowedCvMime(mime: string): boolean {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/rtf",
    "text/rtf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  return allowed.includes(mime);
}

function base64ToBytes(base64: string): ArrayBuffer {
  const clean = base64.includes(",") && base64.startsWith("data:")
    ? base64.slice(base64.indexOf(",") + 1)
    : base64;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function safeExt(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  const ext = dot >= 0 ? fileName.slice(dot).toLowerCase() : "";
  return /^\.[a-z0-9]{1,8}$/.test(ext) ? ext : ".bin";
}

/**
 * Reads the admin-editable Apps Script endpoints from the `site_settings`
 * site_content row (Settings → Form Emails & Endpoints). Returns null when
 * the block is absent or the kind's field is blank — the caller then falls
 * back to the Worker env var.
 */
async function savedEndpoint(
  db: D1Database,
  kind: string,
): Promise<string | null> {
  try {
    const row = await db
      .prepare("select value_en from site_content where key='site_settings'")
      .first<{ value_en: string }>();
    if (!row?.value_en) return null;
    const parsed = JSON.parse(row.value_en) as Record<string, unknown>;
    const field =
      kind === "inquiry"
        ? "inquiry_endpoint"
        : kind === "registration"
          ? "registration_endpoint"
          : "application_endpoint";
    const value = parsed[field];
    return typeof value === "string" && value.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}

function mirrorEndpoint(kind: string, env: Env): string | null {
  switch (kind) {
    case "inquiry":
      return env.INQUIRY_ENDPOINT || null;
    case "registration":
      return env.REGISTRATION_ENDPOINT || null;
    case "application":
      return env.APPLICATION_ENDPOINT || null;
    default:
      return null;
  }
}
