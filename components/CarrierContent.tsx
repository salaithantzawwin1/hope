"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { fetchSiteContent } from "@/lib/db";
import { FALLBACK_CARRIER } from "@/lib/fallback-data";
import type { CarrierContent } from "@/lib/types";

function parseJson<T>(raw: string | undefined): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Renders the Carrier page sections (hero, positions, requirements, apply)
 * from the `site_content` table, which staff edit in the admin portal.
 * Until a row exists, the `fallback` prop is shown.
 */
export default function CarrierPageContent() {
  const locale = useLocale();
  const [db, setDb] = useState<CarrierContent | null>(null);

  useEffect(() => {
    let active = true;
    fetchSiteContent().then((map) => {
      if (!active) return;
      const parsed = parseJson<CarrierContent>(map["carrier_content"]?.en);
      if (parsed) setDb(parsed);
    });
    return () => {
      active = false;
    };
  }, []);

  const data = db ?? FALLBACK_CARRIER;
  const isMy = locale === "my";
  const pick = (en: string, my: string) => {
    const value = isMy && my.trim() ? my : en;
    return value || en;
  };
  const pickArr = (en: string[], my: string[]) => (isMy && my.length ? my : en);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-dark text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand to-brand-light opacity-90" />
        <div className="relative mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-accent">
              Hope International School
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {pick(data.hero_title_en, data.hero_title_my)}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-200">
              {pick(data.hero_subtitle_en, data.hero_subtitle_my)}
            </p>
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {pick(data.why_title_en, data.why_title_my)}
        </h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">
          {pick(data.why_text_en, data.why_text_my)}
        </p>
      </section>

      {/* Job Positions */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {pick(data.positions_title_en, data.positions_title_my)}
          </h2>
          <p className="mt-3 text-slate-500">
            {pick(data.positions_subtitle_en, data.positions_subtitle_my)}
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.positions.map((pos, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold leading-snug text-slate-900">
                    {pick(pos.title_en, pos.title_my)}
                  </h3>
                  <span className="shrink-0 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                    {pick(pos.type_en, pos.type_my)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {pick(pos.desc_en, pos.desc_my)}
                </p>
              </div>
            ))}
            {data.positions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                No open positions at this time.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Job Requirements */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {pick(data.requirements_title_en, data.requirements_title_my)}
        </h2>
        <ul className="mt-6 space-y-3">
          {pickArr(data.requirements_en, data.requirements_my).map((req, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs text-brand">
                ✓
              </span>
              <span className="text-sm leading-relaxed text-slate-700">
                {req}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* How to Apply */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {pick(data.apply_title_en, data.apply_title_my)}
          </h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            {(isMy ? data.apply_steps_my : data.apply_steps_en).map(
              (step, i) => (
                <li
                  key={i}
                  className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-base font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-bold leading-snug text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {step.desc}
                  </p>
                </li>
              ),
            )}
          </ol>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="mx-4 mb-12 overflow-hidden rounded-3xl bg-brand-light text-white sm:mx-6">
        <div className="mx-auto flex max-w-7xl 2xl:max-w-[1440px] flex-col items-start justify-between gap-5 px-4 py-10 sm:px-6 sm:py-12 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold sm:text-3xl">
              {pick(data.contact_note_en, data.contact_note_my)}
            </h2>
            <p className="mt-1.5 text-sm text-slate-100">
              {pick(data.contact_phone_en, data.contact_phone_my)}
            </p>
          </div>
          <a
            href={`mailto:${pick(data.contact_email_en, data.contact_email_my)}`}
            className="shrink-0 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-brand-dark shadow transition-colors hover:bg-accent-dark"
          >
            Apply Now
          </a>
        </div>
      </section>
    </>
  );
}
