"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pickHeading, usePageHeadings } from "./usePageHeadings";

/**
 * The blue CTA band at the bottom of the Academics page. Title, text and
 * button label are editable in the admin portal (Settings → Page Headings);
 * the message catalog supplies the defaults.
 */
export default function AcademicsCta() {
  const t = useTranslations("academics");
  const locale = useLocale();
  const headings = usePageHeadings();

  const title = pickHeading(
    headings,
    locale,
    "academics_cta_title_en",
    "academics_cta_title_my",
    t("ctaTitle"),
  );
  const text = pickHeading(
    headings,
    locale,
    "academics_cta_text_en",
    "academics_cta_text_my",
    t("ctaText"),
  );
  const button = pickHeading(
    headings,
    locale,
    "academics_cta_button_en",
    "academics_cta_button_my",
    t("ctaButton"),
  );

  return (
    <section className="mx-4 mb-12 overflow-hidden rounded-3xl bg-brand-light text-white sm:mx-6">
      <div className="mx-auto flex max-w-7xl 2xl:max-w-[1440px] flex-col items-start justify-between gap-5 px-4 py-10 sm:px-6 sm:py-12 md:flex-row md:items-center">
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
          <p className="mt-1.5 text-sm text-slate-100">{text}</p>
        </div>
        <Link
          href="/admissions"
          className="shrink-0 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-brand-dark shadow transition-colors hover:bg-accent-dark"
        >
          {button}
        </Link>
      </div>
    </section>
  );
}
