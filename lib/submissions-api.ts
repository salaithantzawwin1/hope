/**
 * Typed client for the staff-only side of /api/submissions (see
 * worker/submissions.ts): list, edit (archive notes), delete and download
 * CVs. The public POST lives in lib/submissions.ts.
 */

import { apiWrite, getJson } from "./api";

export interface Submission {
  id: string;
  kind: "inquiry" | "registration" | "application";
  data: Record<string, unknown>;
  /** R2 object key for job-application CVs (null for the other kinds). */
  cv_key: string | null;
  created_at: string;
}

export const submissionsApi = {
  /** Latest 200 entries, optionally filtered by kind. */
  list: (kind?: Submission["kind"]) =>
    getJson<{ items: Submission[] }>(
      kind ? `/api/submissions?kind=${encodeURIComponent(kind)}` : "/api/submissions",
    ).then((r) => r.items),

  /** Replace the payload JSON — used to archive notes into an entry. */
  update: (id: string, data: Record<string, unknown>) =>
    apiWrite<{ updated: number }>("/api/submissions", "PATCH", { id, data }),

  /** Delete one entry (the Worker removes the R2 CV with it). */
  remove: (id: string) =>
    apiWrite<{ deleted: string }>(
      `/api/submissions?id=${encodeURIComponent(id)}`,
      "DELETE",
    ),
};

/** Signed-in download of an application's CV (staff-only R2 fetch). */
export function cvDownloadUrl(id: string): string {
  return `/api/submissions/cv/${encodeURIComponent(id)}`;
}
