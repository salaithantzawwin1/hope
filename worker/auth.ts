/**
 * Auth for the Worker's staff-only routes (Phase 3).
 *
 * Staff sign in with a shared passphrase (the `STAFF_PASSPHRASE` secret);
 * the Worker issues an HMAC-signed session cookie (the `SESSION_SECRET`
 * secret signs it). No third-party auth dependency, no database rows —
 * the signed cookie is the entire session.
 *
 *   POST /api/auth/login    { passphrase } → Set-Cookie hope_session=…
 *   POST /api/auth/logout   → clears the cookie
 *   GET  /api/auth/check    → { authed: boolean }
 *
 * Cookie value: `<expiresAtMs>.<hex hmac of expiresAtMs>` — verified by
 * re-computing the HMAC (constant-time compare) and checking expiry.
 * Flags: HttpOnly, Secure, SameSite=Strict, 7-day Max-Age.
 *
 * Replacing this with Cloudflare Access later (plan §6) means swapping the
 * three auth routes and `requireStaff` for `Cf-Access-Jwt-Assertion`
 * verification — every route handler keeps calling `requireStaff`.
 */

const SESSION_COOKIE = "hope_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface SessionEnv {
  /** Secret used to sign session cookies (e.g. `openssl rand -hex 32`). */
  SESSION_SECRET: string;
  /** Shared staff passphrase for the admin portal. */
  STAFF_PASSPHRASE: string;
}

/** 401 response with a short cache lifetime so browsers don't retry blindly. */
export function unauthorized(message = "Unauthorized"): Response {
  return new Response(JSON.stringify({ error: "unauthorized", message }), {
    status: 401,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export function badRequest(message: string): Response {
  return new Response(JSON.stringify({ error: "bad_request", message }), {
    status: 400,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

/** HMAC-SHA256 of a message, hex-encoded. */
async function hmacHex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return [...new Uint8Array(mac)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Length-independent constant-time string comparison. */
function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  const len = Math.max(aBytes.length, bBytes.length);
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < len; i += 1) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

function buildCookieValue(expiresAtMs: number, secret: string): Promise<string> {
  return hmacHex(String(expiresAtMs), secret).then(
    (mac) => `${expiresAtMs}.${mac}`,
  );
}

async function isValidSession(
  value: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!value) return false;
  const dot = value.indexOf(".");
  if (dot <= 0) return false;
  const expiresAtMs = Number(value.slice(0, dot));
  const mac = value.slice(dot + 1);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs < Date.now()) return false;
  const expected = await hmacHex(String(expiresAtMs), secret);
  return timingSafeEqual(mac, expected);
}

function readSessionCookie(request: Request): string | undefined {
  const cookie = request.headers.get("cookie") ?? "";
  for (const part of cookie.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq) === SESSION_COOKIE) {
      return decodeURIComponent(part.slice(eq + 1));
    }
  }
  return undefined;
}

/** True when the request carries a valid, unexpired session cookie. */
export async function isStaff(
  request: Request,
  env: SessionEnv,
): Promise<boolean> {
  return isValidSession(readSessionCookie(request), env.SESSION_SECRET);
}

/**
 * Guard for write routes. Returns true when authenticated; the caller should
 * return `unauthorized()` otherwise.
 */
export async function requireStaff(
  request: Request,
  env: SessionEnv,
): Promise<boolean> {
  return isStaff(request, env);
}

// ---------------------------------------------------------------------------
// Auth routes
// ---------------------------------------------------------------------------

export async function handleLogin(
  request: Request,
  env: SessionEnv,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405, { allow: "POST" });
  }
  let passphrase = "";
  try {
    const body = (await request.json()) as { passphrase?: unknown };
    if (typeof body.passphrase === "string") passphrase = body.passphrase;
  } catch {
    return badRequest("Expected a JSON body");
  }
  if (!passphrase || !timingSafeEqual(passphrase, env.STAFF_PASSPHRASE)) {
    // Same message for wrong passphrase so errors don't leak config state.
    return unauthorized("Incorrect passphrase");
  }

  const expiresAtMs = Date.now() + SESSION_TTL_MS;
  const value = await buildCookieValue(expiresAtMs, env.SESSION_SECRET);
  return json(
    { authed: true },
    200,
    {
      "set-cookie":
        `${SESSION_COOKIE}=${encodeURIComponent(value)}; Max-Age=${SESSION_TTL_MS / 1000}; ` +
        "Path=/; HttpOnly; Secure; SameSite=Strict",
    },
  );
}

export async function handleLogout(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405, { allow: "POST" });
  }
  return json({ authed: false }, 200, {
    "set-cookie": `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`,
  });
}

export async function handleAuthCheck(
  request: Request,
  env: SessionEnv,
): Promise<Response> {
  return json({ authed: await isStaff(request, env) });
}
