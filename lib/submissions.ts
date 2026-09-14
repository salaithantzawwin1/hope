/**
 * Submission submission path for the static site.
 *
 * The site's forms now POST to the same-origin Worker (`/api/submissions`),
 * which stores the entry in D1 (the admin portal's inbox) and mirrors it to
 * the Google Apps Script emailer (Sheet + email) exactly as when the browser
 * posted there directly. Nothing about the Google setup changes.
 *
 * Fallback: when the Worker route is unreachable (e.g. the site is deployed
 * to plain static hosting without the Worker), the form still submits
 * straight to the Apps Script endpoint — and if that is not configured
 * either, the caller opens the visitor's mail app as the last resort.
 */

export type SubmissionKind = "inquiry" | "registration" | "application";

export type SubmitViaWorkerResult = {
  ok: boolean;
  /** "endpoint" → forwarded to the Apps Script mirror; "worker" → stored by the Worker. */
  via?: "worker" | "endpoint";
  error?: "network" | "server" | "rate_limited";
};

/**
 * POST a submission to the Worker inbox; on failure, fall back to POSTing
 * the original payload to the Apps Script endpoint (if configured).
 */
export async function submitToInbox(
  kind: SubmissionKind,
  payload: Record<string, unknown>,
  mirrorEndpoint: string,
): Promise<SubmitViaWorkerResult> {
  try {
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, payload }),
    });
    if (res.ok) return { ok: true, via: "worker" };
    if (res.status === 429) return { ok: false, error: "rate_limited" };
    // 4xx/5xx from the Worker: fall through to the direct mirror only for
    // infrastructure failures. Validation errors (400) should not be retried
    // against the mirror — the visitor needs to fix the form either way.
    if (res.status >= 500) throw new Error(`Worker failed (${res.status})`);
    return { ok: false, error: "server" };
  } catch {
    // Worker unreachable (static hosting / network) → try the mirror.
    if (!mirrorEndpoint) return { ok: false, error: "network" };
    try {
      const res = await fetch(mirrorEndpoint, {
        method: "POST",
        // text/plain keeps this a CORS-safelisted "simple request" — Apps
        // Script does not answer OPTIONS preflights (see lib/registration.ts).
        headers: { "content-type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      if (res.ok) return { ok: true, via: "endpoint" };
      return { ok: false, error: "server" };
    } catch {
      return { ok: false, error: "network" };
    }
  }
}
