"use client";

import { useLocale, useTranslations } from "next-intl";
import PageHeader from "./PageHeader";
import Gallery from "./Gallery";
import { pickHeading, usePageHeadings } from "./usePageHeadings";

/**
 * Client wrapper for the Gallery page: the title/subtitle come from the
 * admin-editable page headings block (Settings → Page Headings) with the
 * message catalog as fallback, and the album grid renders below.
 */
export default function GalleryPageContent() {
  const t = useTranslations("gallery");
  const locale = useLocale();
  const headings = usePageHeadings();
  const title = pickHeading(
    headings,
    locale,
    "gallery_title_en",
    "gallery_title_my",
    t("title"),
  );
  const subtitle = pickHeading(
    headings,
    locale,
    "gallery_subtitle_en",
    "gallery_subtitle_my",
    t("subtitle"),
  );

  return (
    <>
      <PageHeader title={title}>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200">
          {subtitle}
        </p>
      </PageHeader>

      <section className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
        <Gallery />
      </section>
    </>
  );
}
