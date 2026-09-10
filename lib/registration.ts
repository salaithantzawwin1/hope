/**
 * Registration submission for the static site.
 *
 * The site has no server, so registrations are POSTed to a free Google Apps
 * Script Web App (see `registration-emailer/Code.gs`), which appends each
 * entry to a Google Sheet and emails the list as an .xlsx file to
 * REGISTRATION_EMAIL.
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

export async function submitRegistration(
  data: RegistrationPayload,
): Promise<RegistrationResult> {
  if (!REGISTRATION_ENDPOINT) return { ok: false, error: "notConfigured" };
  try {
    const res = await fetch(REGISTRATION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return { ok: false, error: "server" };
    return { ok: true };
  } catch {
    return { ok: false, error: "network" };
  }
}