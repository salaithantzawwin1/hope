/**
 * Admissions inquiry submission for the static site.
 *
 * The site has no server, so inquiries are POSTed to a free Google Apps
 * Script Web App (see `inquiry-emailer/Code.gs`), which appends each
 * entry to a Google Sheet and emails it to INQUIRY_EMAIL.
 */

export type InquiryPayload = {
  name: string;
  email: string;
  phone: string;
  grade: string;
  message: string;
  locale: string;
  submittedAt: string;
};

/**
 * Google Apps Script Web App URL that receives admissions inquiries.
 * After deploying `inquiry-emailer/Code.gs` (see README → "Inquiry
 * form"), paste the deployed /exec URL here. Keep this empty until then —
 * the form falls back to opening the visitor's email app.
 */
export const INQUIRY_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzAupkctbOxy9F86d4wf58pTXw5fuBDKCJ2BMzH1PaZY9rBAPk8lEt4HHbrySSCLAew/exec";

/**
 * Address that receives admissions inquiries. Must match ADMIN_EMAIL at
 * the top of `inquiry-emailer/Code.gs`. Also used as the mailto fallback
 * recipient while INQUIRY_ENDPOINT is empty.
 */
export const INQUIRY_EMAIL = "iyfmyanmar.admin@gmail.com";

export type InquiryResult = {
  ok: boolean;
  error?: "notConfigured" | "network" | "server";
};

export async function submitInquiry(
  data: InquiryPayload,
): Promise<InquiryResult> {
  if (!INQUIRY_ENDPOINT) return { ok: false, error: "notConfigured" };
  try {
    const res = await fetch(INQUIRY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return { ok: false, error: "server" };
    return { ok: true };
  } catch {
    return { ok: false, error: "network" };
  }
}
