"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fetchSiteContent } from "@/lib/db";
import type { HomeCta, HomePrograms, HomeStats } from "@/lib/types";

const PROGRAM_ICONS = ["A", "B", "C", "D"];

function parseJson<T>(raw: string | undefined): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Loads one editable Home section stored as JSON in a site_content row. */
function useBlock<T>(key: string, fallback: T): T {
  const [db, setDb] = useState<T | null>(null);
  useEffect(() => {
    let active = true;
    fetchSiteContent().then((map) => {
      if (!active) return;
      setDb(parseJson<T>(map[key]?.en));
    });
    return () => {
      active = false;
    };
  }, [key]);
  return db ?? fallback;
}

/**
 * Renders the Home page sections (hero stats, programs, CTA banner) from the
 * `site_content` table, which staff edit in the admin portal. Each section is
 * stored as JSON in a single site_content row; until a row exists the
 * `fallback` prop (from the message catalogs) is shown.
 */

/** The stat numbers under the hero banner. */
export function HomeStats({ fallback }: { fallback: HomeStats }) {
  const locale = useLocale();
  const data = useBlock<HomeStats>("home_stats", fallback);
  const isMy = locale === "my";
  // Empty fields fall back to the English value (same rule as SiteText).
  const pick = (en: string, my: string) => {
    const value = isMy && my.trim() ? my : en;
    return value || en;
  };

  return (
    <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {data.stats.map((s, i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center backdrop-blur"
        >
          <div className="text-2xl font-bold text-accent sm:text-3xl">
            {pick(s.number_en, s.number_my)}
          </div>
          <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-300 sm:text-sm">
            {pick(s.label_en, s.label_my)}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The "Our Programs" cards section. */
export function HomePrograms({ fallback }: { fallback: HomePrograms }) {
  const locale = useLocale();
  const data = useBlock<HomePrograms>("home_programs", fallback);
  const isMy = locale === "my";
  const pick = (en: string, my: string) => {
    const value = isMy && my.trim() ? my : en;
    return value || en;
  };

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-6xl xl:max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-slate-900">
            {pick(data.title_en, data.title_my)}
          </h2>
          <p className="mt-3 text-slate-500">
            {pick(data.subtitle_en, data.subtitle_my)}
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.programs.map((program, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-xl font-bold text-brand">
                {PROGRAM_ICONS[i % PROGRAM_ICONS.length]}
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                {pick(program.title_en, program.title_my)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {pick(program.desc_en, program.desc_my)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The bottom CTA banner. */
export function HomeCta({ fallback }: { fallback: HomeCta }) {
  const locale = useLocale();
  const data = useBlock<HomeCta>("home_cta", fallback);
  const isMy = locale === "my";
  const pick = (en: string, my: string) => {
    const value = isMy && my.trim() ? my : en;
    return value || en;
  };

  return (
    <section className="relative overflow-hidden bg-brand text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 h-48 w-48 rounded-full bg-accent/20 blur-3xl"
      />
      <div className="relative mx-auto flex max-w-6xl xl:max-w-7xl flex-col items-start justify-between gap-5 px-4 py-10 sm:px-6 md:flex-row md:items-center">
        <div className="max-w-xl">
          <h2 className="text-xl font-bold sm:text-2xl">
            {pick(data.title_en, data.title_my)}
          </h2>
          <p className="mt-1.5 text-sm text-slate-200">
            {pick(data.text_en, data.text_my)}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admissions"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-brand-dark shadow transition-colors hover:bg-accent-dark"
          >
            {pick(data.button_en, data.button_my)}
          </Link>
          <Link
            href="/admissions"
            className="rounded-lg border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            {pick(data.secondary_en, data.secondary_my)}
          </Link>
        </div>
      </div>
    </section>
  );
}