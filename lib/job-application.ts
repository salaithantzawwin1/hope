/**
 * Job application submission for the static site.
 *
 * The site has no server, so applications are POSTed to a free Google Apps
 * Script Web App (see `application-emailer/Code.gs`), which saves the CV to
 * a Google Drive folder, logs the application in a Google Sheet, and emails
 * it (with the CV attached) to APPLICATION_EMAIL.
 */

export type JobApplicationPayload = {
  /** Applicant full name. */
  name: string;
  phone: string;
  email: string;
  /** Position title the applicant is applying for. */
  position: string;
  /** Optional short message from the applicant. */
  notes: string;
  /** Original CV file name, e.g. "my-cv.pdf". */
  cvFileName: string;
  /** CV mime type, e.g. "application/pdf". */
  cvMimeType: string;
  /** CV contents, base64-encoded by the browser (btoa). */
  cvBase64: string;
  locale: string;
  submittedAt: string;
};

/**
 * Google Apps Script Web App URL that receives job applications.
 * After deploying `application-emailer/Code.gs` (see README → "Job
 * application form"), paste the deployed /exec URL here. Keep this empty
 * until then — the form falls back to opening the visitor's email app.
 */
export const APPLICATION_ENDPOINT =
  "https://script.google.com/macros/s/AKfycby84waf_QodYf4pwoICrUXRNK-LZIrf7OnvrTH0QzXvKrjJHY_prDuxCeeUW1j4toUROA/exec";

/** Admin address that receives job applications (see Code.gs ADMIN_EMAIL). */
export const APPLICATION_EMAIL = "iyfmyanmar.admin@gmail.com";

/** Reject CVs larger than this before upload (Apps Script fetch limit ≈ 50 MB). */
export const MAX_CV_BYTES = 10 * 1024 * 1024; // 10 MB

export type JobApplicationResult = {
  ok: boolean;
  error?: "notConfigured" | "tooLarge" | "network" | "server";
};

export async function submitJobApplication(
  data: JobApplicationPayload,
): Promise<JobApplicationResult> {
  if (!APPLICATION_ENDPOINT) return { ok: false, error: "notConfigured" };
  try {
    const res = await fetch(APPLICATION_ENDPOINT, {
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
