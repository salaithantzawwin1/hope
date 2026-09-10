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

/** A navigation link (href + bilingual label), used in the header and footer. */
export interface NavLink {
  href: string;
  label_en: string;
  label_my: string;
}

export interface HeaderContent {
  /** Logo image URL (falls back to the built-in /Logo.jpg when empty). */
  logo_url: string;
  /** Nav menu items shown in the header. */
  links: NavLink[];
}

export interface FooterContent {
  tagline_en: string;
  tagline_my: string;
  address_en: string;
  address_my: string;
  phone_en: string;
  phone_my: string;
  email_en: string;
  email_my: string;
  hours_en: string;
  hours_my: string;
  /** Quick links shown in the footer (internal paths like "/about"). */
  links: NavLink[];
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption_en: string | null;
  caption_my: string | null;
  /** Album this photo belongs to (optional; empty = uncategorized). */
  album_en: string | null;
  album_my: string | null;
  /** Short album description shown on the cover card and album page. */
  album_desc_en: string | null;
  album_desc_my: string | null;
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
  /**
   * Extra cards appended after Mission and Vision in the same
   * "Purpose & Direction" grid (desktop shows up to 4 across).
   */
  extra_cards: AboutCustomCard[];
}

export interface AboutValue {
  title_en: string;
  title_my: string;
  desc_en: string;
  desc_my: string;
}

/** One "Why Choose Hope?" highlight (icon + title + text). */
export interface WhyChooseItem {
  icon: string;
  title_en: string;
  title_my: string;
  text_en: string;
  text_my: string;
}

export interface WhyChoose {
  title_en: string;
  title_my: string;
  items: WhyChooseItem[];
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

export interface AboutCustomCard {
  icon: string;
  title_en: string;
  title_my: string;
  text_en: string;
  text_my: string;
}

export interface AboutCustomSection {
  eyebrow_en: string;
  eyebrow_my: string;
  title_en: string;
  title_my: string;
  cards: AboutCustomCard[];
}

export interface AboutFacts {
  title_en: string;
  title_my: string;
  facts: AboutFact[];
}

/** A job position listed on the Carrier page. */
export interface CarrierPosition {
  title_en: string;
  title_my: string;
  type_en: string;
  type_my: string;
  desc_en: string;
  desc_my: string;
  /** Requirements specific to this position. */
  requirements_en: string[];
  requirements_my: string[];
  /** Inactive positions are hidden from the public Carrier page. */
  active: boolean;
}

/** Carrier page content (editable from the admin portal). */
export interface CarrierContent {
  /** Hero title (e.g. "We Are Hiring"). */
  hero_title_en: string;
  hero_title_my: string;
  hero_subtitle_en: string;
  hero_subtitle_my: string;
  /** Why join section. */
  why_title_en: string;
  why_title_my: string;
  why_text_en: string;
  why_text_my: string;
  /** Open positions section. */
  positions_title_en: string;
  positions_title_my: string;
  positions_subtitle_en: string;
  positions_subtitle_my: string;
  positions: CarrierPosition[];
  /** Job requirements section heading (requirements live on each position). */
  requirements_title_en: string;
  requirements_title_my: string;
  /** How to apply section. */
  apply_title_en: string;
  apply_title_my: string;
  apply_steps_en: { title: string; desc: string }[];
  apply_steps_my: { title: string; desc: string }[];
  /** Contact info for applying. */
  contact_phone_en: string;
  contact_phone_my: string;
  contact_email_en: string;
  contact_email_my: string;
  contact_note_en: string;
  contact_note_my: string;
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