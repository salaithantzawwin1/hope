/**
 * /api/images — R2-backed image routes (Phase 1).
 *
 *   GET    /api/images          → list objects (public)
 *   PUT    /api/images          → staff only; binary body, stored as
 *                               folder/timestamp-rand.jpg, returns { url }
 *   DELETE /api/images?key=…    → staff only; deletes one object
 *
 * Objects are addressed by their R2 key; the public URL is built from
 * IMAGE_PUBLIC_BASE_URL.
 */

import { badRequest, requireStaff, unauthorized } from "./auth";
import type { Env } from "./index";

/** Only known upload folders are accepted, so keys stay predictable. */
const ALLOWED_FOLDERS = new Set(["news", "gallery", "events"]);

export async function handleImages(
  request: Request,
  env: Env,
): Promise<Response> {
  // R2 may be unbound (bucket not yet enabled/created in the account).
  // Fail softly so the rest of the site and admin portal keep working.
  if (!env.IMAGES) {
    return json(
      {
        error: "storage_unavailable",
        detail: "R2 is not configured — enable R2 in the Cloudflare dashboard, create the hope-images bucket, and redeploy.",
      },
      503,
    );
  }

  const { method } = request;
  const url = new URL(request.url);

  if (method === "GET") return listImages(env);

  if (method === "PUT") return putImage(request, env);

  if (method === "DELETE") {
    if (!(await requireStaff(request, env))) return unauthorized();
    const key = url.searchParams.get("key");
    if (!key) return badRequest("Missing ?key= (the R2 object key)");
    await env.IMAGES.delete(key);
    return json({ deleted: key });
  }

  return new Response(JSON.stringify({ error: "method_not_allowed" }), {
    status: 405,
    headers: { allow: "GET, PUT, DELETE" },
  });
}

async function listImages(env: Env): Promise<Response> {
  const listed = await env.IMAGES.list();
  return json({
    images: listed.objects.map((o) => ({
      key: o.key,
      size: o.size,
      uploaded: o.uploaded.toISOString(),
    })),
    truncated: listed.truncated,
  });
}

async function putImage(request: Request, env: Env): Promise<Response> {
  if (!(await requireStaff(request, env))) return unauthorized();

  const url = new URL(request.url);
  const folder = url.searchParams.get("folder") ?? "gallery";
  if (!/^[a-z0-9-]+$/.test(folder) || !ALLOWED_FOLDERS.has(folder)) {
    return badRequest(
      `folder must be one of: ${[...ALLOWED_FOLDERS].join(", ")}`,
    );
  }
  if ((request.headers.get("content-length") ?? "1") === "0") {
    return badRequest("Empty body — send the image bytes");
  }

  const body = await request.arrayBuffer();
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
  await env.IMAGES.put(key, body, {
    httpMetadata: { contentType: "image/jpeg" },
  });

  const base = env.IMAGE_PUBLIC_BASE_URL?.replace(/\/+$/, "") ?? "";
  const publicUrl = base ? `${base}/${key}` : key;
  return json({ url: publicUrl, key }, 201);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
