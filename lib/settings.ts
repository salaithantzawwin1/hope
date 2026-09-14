/**
 * Site-wide settings, editable from the admin portal (Settings tab) and
 * stored as one JSON block in the `site_settings` site_content row.
 *
 * Everything here used to be a hardcoded constant scattered across
 * lib/registration.ts, lib/inquiry.ts, lib/job-application.ts and
 * lib/db.ts — changing the school's email or adding a grade level used to
 * require a code change and rebuild. Now staff edit it in the portal.
 *
 * Consumer rule (same as every other editable block): a saved value wins;
 * empty/absent values fall back to the built-in defaults below, so a
 * partially saved block can never blank the site.
 */

export interface SiteSettings {
  /** School display name (header wordmark, footer brand, page copy). */
  school_name_en: string;
  school_name_my: string;
  /** Sub-label under the school name in the header/footer wordmark. */
  school_tagline_en: string;
  school_tagline_my: string;
  /** Logo image URL shown in the footer brand (header has its own editor). */
  footer_logo_url: string;
  /** Recipient addresses + Apps Script endpoints for the three public forms. */
  inquiry_email: string;
  registration_email: string;
  application_email: string;
  inquiry_endpoint: string;
  registration_endpoint: string;
  application_endpoint: string;
  /** Grade options for the inquiry + registration forms' dropdowns. */
  grade_levels: string[];
}

/** Built-in defaults — what the site shows/uses before the first save. */
export const DEFAULT_SETTINGS: SiteSettings = {
  school_name_en: "Hope",
  school_name_my: "Hope",
  school_tagline_en: "International School",
  school_tagline_my: "International School",
  footer_logo_url: "/Logo.jpg",
  inquiry_email: "iyfmyanmar.admin@gmail.com",
  registration_email: "iyfmyanmar.admin@gmail.com",
  application_email: "iyfmyanmar.admin@gmail.com",
  inquiry_endpoint:
    "https://script.google.com/macros/s/AKfycbzAupkctbOxy9F86d4wf58pTXw5fuBDKCJ2BMzH1PaZY9rBAPk8lEt4HHbrySSCLAew/exec",
  registration_endpoint:
    "https://script.google.com/macros/s/AKfycbzpJyV1JBNb7ScKFe3h2bYj2kJUBcENfs2MuZcO_qCOwvG-dMPgtA6t0mmpXuKrMVQ6/exec",
  application_endpoint:
    "https://script.google.com/macros/s/AKfycby84waf_QodYf4pwoICrUXRNK-LZIrf7OnvrTH0QzXvKrjJHY_prDuxCeeUW1j4toUROA/exec",
  grade_levels: [
    "Early Years",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
  ],
};

export const SETTINGS_KEY = "site_settings";

/**
 * Merge a (possibly partial / older) saved JSON block over the defaults.
 * Grade levels: the saved list replaces the default only when it is a
 * non-empty array of strings.
 */
export function mergeSettings(saved: unknown): SiteSettings {
  const raw = (saved && typeof saved === "object" ? saved : {}) as Record<
    string,
    unknown
  >;
  const merged: SiteSettings = { ...DEFAULT_SETTINGS };
  const target = merged as unknown as Record<string, unknown>;
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
    if (key === "grade_levels") continue;
    const value = raw[key];
    if (typeof value === "string" && value.trim()) {
      target[key] = value.trim();
    }
  }
  const grades = raw.grade_levels;
  if (
    Array.isArray(grades) &&
    grades.length > 0 &&
    grades.every((g) => typeof g === "string")
  ) {
    merged.grade_levels = (grades as string[]).map((g) => g.trim());
  }
  return merged;
}

/**
 * Parse the settings block out of a site_content value (the value is stored
 * as JSON in value_en; value_my mirrors it, same as the other JSON blocks).
 */
export function parseSettings(json: string | undefined | null): SiteSettings | null {
  if (!json || !json.trim()) return null;
  try {
    return mergeSettings(JSON.parse(json));
  } catch {
    return null;
  }
}
