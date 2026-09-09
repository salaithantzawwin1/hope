export type Locale = "en" | "my";

export interface NewsItem {
  id: string;
  title_en: string;
  title_my: string;
  body_en: string;
  body_my: string;
  image_url: string | null;
  published_at: string;
  created_at: string;
}

export interface EventItem {
  id: string;
  title_en: string;
  title_my: string;
  date: string; // YYYY-MM-DD
  time: string | null;
  location_en: string | null;
  location_my: string | null;
  description_en: string | null;
  description_my: string | null;
  /** Optional event flyer/poster image (portrait works best). */
  image_url: string | null;
  created_at: string;
}

export interface SiteContentRow {
  key: string;
  value_en: string;
  value_my: string;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption_en: string | null;
  caption_my: string | null;
  created_at: string;
}

export interface AcademicsCurriculum {
  title_en: string;
  title_my: string;
  text_en: string;
  text_my: string;
  points_en: string[];
  points_my: string[];
}

export interface AcademicsLevel {
  name_en: string;
  name_my: string;
  age_en: string;
  age_my: string;
  desc_en: string;
  desc_my: string;
}

export interface AcademicsLevels {
  title_en: string;
  title_my: string;
  levels: AcademicsLevel[];
}

export interface AcademicsProgram {
  title_en: string;
  title_my: string;
  desc_en: string;
  desc_my: string;
}

export interface AcademicsPrograms {
  title_en: string;
  title_my: string;
  subtitle_en: string;
  subtitle_my: string;
  programs: AcademicsProgram[];
}

export interface AboutMissionVision {
  mission_title_en: string;
  mission_title_my: string;
  mission_text_en: string;
  mission_text_my: string;
  vision_title_en: string;
  vision_title_my: string;
  vision_text_en: string;
  vision_text_my: string;
}

export interface AboutValue {
  title_en: string;
  title_my: string;
  desc_en: string;
  desc_my: string;
}

export interface AboutValues {
  title_en: string;
  title_my: string;
  values: AboutValue[];
}

export interface HomeStat {
  number_en: string;
  number_my: string;
  label_en: string;
  label_my: string;
}

export interface HomeStats {
  stats: HomeStat[];
}

export interface HomeProgram {
  title_en: string;
  title_my: string;
  desc_en: string;
  desc_my: string;
}

export interface HomePrograms {
  title_en: string;
  title_my: string;
  subtitle_en: string;
  subtitle_my: string;
  programs: HomeProgram[];
}

export interface HomeCta {
  title_en: string;
  title_my: string;
  text_en: string;
  text_my: string;
  button_en: string;
  button_my: string;
  secondary_en: string;
  secondary_my: string;
}

export interface AboutFact {
  number_en: string;
  number_my: string;
  label_en: string;
  label_my: string;
}

export interface AboutFacts {
  title_en: string;
  title_my: string;
  facts: AboutFact[];
}

/** Pick the localized field from a bilingual record. */
export function localized<T>(
  row: T,
  locale: string,
  en: keyof T,
  my: keyof T,
): string {
  const value = row[locale === "my" ? my : en];
  return typeof value === "string" && value.trim() ? value : String(row[en] ?? "");
}