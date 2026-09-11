/**
 * Auth helpers for the Worker's staff-only write routes (Phases 1–2).
 *
 * Supabase access tokens are HS256 JWTs signed with the project's JWT secret.
 * The admin portal already holds the token in memory, so we verify it here
 * with WebCrypto and accept `HS256` (typical for Supabase projects; the
 * algorithm is pinned below, never taken from the token header).
 *
 * Phase 3 replaces this with Cloudflare Access JWT verification
 * (docs/cloudflare-migration-plan.md §6).
 */

const EXPECTED_ALG = "HS256";

interface JwtParts {
  header: JwtHeader;
  payload: JwtPayload;
  signingInput: string;
  signatureBytes: Uint8Array;
}

interface JwtHeader {
  alg?: string;
  typ?: string;
}

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
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

/**
 * Verify a Supabase HS256 access token without dependencies.
 * Returns the payload on success, null on any failure (bad format, wrong
 * algorithm, bad signature, expired, or missing secret).
 */
export async function verifySupabaseJwt(
  token: string,
  secret: string,
): Promise<JwtPayload | null> {
  const parts = splitJwt(token);
  if (!parts || parts.header.alg !== EXPECTED_ALG) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signatureOk = await crypto.subtle.verify(
    { name: "HMAC", hash: "SHA-256" },
    key,
    parts.signatureBytes,
    new TextEncoder().encode(parts.signingInput),
  );
  if (!signatureOk) return null;

  // Reject long-expired tokens (Supabase default access-token TTL is 1h;
  // this is a safety net for clock skew, not the primary expiry check).
  const now = Math.floor(Date.now() / 1000);
  if (typeof parts.payload.exp === "number" && parts.payload.exp < now - 60) {
    return null;
  }
  return parts.payload;
}

/**
 * Extract and verify the bearer token from a request.
 * Returns the payload on success, or a 401 Response to return directly.
 */
export async function requireStaff(
  request: Request,
  secret: string,
): Promise<JwtPayload | Response> {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (!token || scheme.toLowerCase() !== "bearer") return unauthorized();
  const payload = await verifySupabaseJwt(token, secret);
  return payload ?? unauthorized("Invalid or expired token");
}

/** Type guard: true when requireStaff returned a payload (not a Response). */
export function isAuthed(value: unknown): value is JwtPayload {
  return typeof value === "object" && value !== null && !("status" in value);
}

function splitJwt(token: string): JwtParts | null {
  const segments = token.split(".");
  if (segments.length !== 3) return null;
  const [headerSeg, payloadSeg, signatureSeg] = segments;
  try {
    const header = JSON.parse(base64UrlDecodeToString(headerSeg)) as JwtHeader;
    const payload = JSON.parse(
      base64UrlDecodeToString(payloadSeg),
    ) as JwtPayload;
    return {
      header,
      payload,
      signingInput: `${headerSeg}.${payloadSeg}`,
      signatureBytes: base64UrlDecodeToBytes(signatureSeg),
    };
  } catch {
    return null;
  }
}

function base64UrlDecodeToBytes(segment: string): Uint8Array {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlDecodeToString(segment: string): string {
  return new TextDecoder().decode(base64UrlDecodeToBytes(segment));
}
