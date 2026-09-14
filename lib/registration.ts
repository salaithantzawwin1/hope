/**
 * Registration submission for the static site.
 *
 * Forms now POST to the Worker inbox first (see lib/submissions.ts), which
 * stores the entry in D1 for the admin portal's Submissions tab and mirrors
 * it to the Apps Script endpoint below (Sheet + email). The constants here
 * remain the built-in defaults; staff can override the endpoint and the
 * public address from the admin Settings tab without a rebuild.
 * (Referenced by RegisterEditable's error notices and the admin editor.)
 */

export type RegistrationPayload = {
  parentName: string;
  email: string;
  phone: string;
  studentName: string;
  grade: string;
  /** Event id from the events table (empty for general inquiries). */
  eventId: string;
  program: string;
  notes: string;
  locale: string;
  submittedAt: string;
};

/**
 * Google Apps Script Web App URL that receives registrations.
 * After deploying `registration-emailer/Code.gs` (see README → "Registration
 * form"), paste the deployed /exec URL here. Keep this empty until then —
 * the form will show a friendly "not connected" message instead of failing.
 */
export const REGISTRATION_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzpJyV1JBNb7ScKFe3h2bYj2kJUBcENfs2MuZcO_qCOwvG-dMPgtA6t0mmpXuKrMVQ6/exec";

/**
 * Public email shown to visitors with registration questions.
 * When the school changes its email later, update it here AND in
 * ADMIN_EMAIL at the top of `registration-emailer/Code.gs`.
 */
export const REGISTRATION_EMAIL = "iyfmyanmar.admin@gmail.com";

export type RegistrationResult = {
  ok: boolean;
  error?: "notConfigured" | "network" | "server";
};

/** Kept as the static-hosting fallback path (see lib/submissions.ts). */
export async function submitRegistration(
  data: RegistrationPayload,
): Promise<RegistrationResult> {
  if (!REGISTRATION_ENDPOINT) return { ok: false, error: "notConfigured" };
  try {
    const res = await fetch(REGISTRATION_ENDPOINT, {
      method: "POST",
      // text/plain keeps this a CORS-safelisted "simple request" — no
      // preflight. Apps Script does not answer OPTIONS preflights, so an
      // application/json content type would make every browser submission
      // fail (curl works fine, which hides the bug). doPost() reads
      // e.postData.contents regardless of the content type.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return { ok: false, error: "server" };
    return { ok: true };
  } catch {
    return { ok: false, error: "network" };
  }
}