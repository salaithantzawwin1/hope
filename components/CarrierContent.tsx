"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import ApplyModal from "@/components/ApplyModal";
import { fetchSiteContent } from "@/lib/db";
import { FALLBACK_CARRIER, normalizeCarrier } from "@/lib/fallback-data";
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
      if (parsed) setDb(normalizeCarrier(parsed));
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
  // Inactive jobs are hidden from the public page.
  const activePositions = data.positions.filter((pos) => pos.active);
  // Apply Now opens the application popup; the position is pre-selected
  // with the job chosen in the CTA dropdown (automatic with a single job).
  const [jobChoice, setJobChoice] = useState(0);
  const [applyOpen, setApplyOpen] = useState(false);
  const chosen =
    activePositions.length > 0
      ? activePositions[Math.min(jobChoice, activePositions.length - 1)]
      : undefined;
  const positionTitles = activePositions.map((pos) =>
    pick(pos.title_en, pos.title_my),
  );

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

      {/* Job Positions — each card includes its own requirements */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {pick(data.positions_title_en, data.positions_title_my)}
          </h2>
          <p className="mt-3 text-slate-500">
            {pick(data.positions_subtitle_en, data.positions_subtitle_my)}
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {activePositions.map((pos, i) => {
              const reqs = pickArr(pos.requirements_en, pos.requirements_my);
              return (
                <div
                  key={pos.title_en || i}
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
                  {reqs.length > 0 && (
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        {pick(
                          data.requirements_title_en,
                          data.requirements_title_my,
                        )}
                      </p>
                      <ul className="mt-3 space-y-2.5">
                        {reqs.map((req, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs text-brand">
                              ✓
                            </span>
                            <span className="text-sm leading-relaxed text-slate-700">
                              {req}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
            {activePositions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                No open positions at this time.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How to Apply — one shared section for all jobs */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {pick(data.apply_title_en, data.apply_title_my)}
          </h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            {(isMy ? data.apply_steps_my : data.apply_steps_en).map((step, i) => (
              <li
                key={i}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-base font-bold text-white">
                  {i + 1}
                </span>
                <h4 className="mt-4 font-bold leading-snug text-slate-900">
                  {step.title}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Contact CTA — one shared block for all jobs */}
      <section className="mx-4 mb-12 sm:mx-6">
        <div className="overflow-hidden rounded-3xl bg-brand-light text-white">
          <div className="mx-auto flex max-w-7xl 2xl:max-w-[1440px] flex-col items-start justify-between gap-5 px-4 py-10 sm:px-6 sm:py-12 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold sm:text-3xl">
                {pick(data.contact_note_en, data.contact_note_my)}
              </h2>
              <p className="mt-1.5 text-sm text-slate-100">
                {pick(data.contact_phone_en, data.contact_phone_my)}
              </p>
            </div>
            {activePositions.length > 0 && (
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                {activePositions.length > 1 && (
                  <select
                    value={Math.min(jobChoice, activePositions.length - 1)}
                    onChange={(e) => setJobChoice(Number(e.target.value))}
                    className="rounded-lg border border-white/30 bg-white/10 px-3 py-2.5 text-sm font-medium text-white outline-none focus:border-white/60"
                  >
                    {activePositions.map((pos, i) => (
                      <option key={i} value={i} className="text-slate-900">
                        {pick(pos.title_en, pos.title_my)}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => setApplyOpen(true)}
                  className="rounded-lg bg-accent px-5 py-2.5 text-center text-sm font-bold text-brand-dark shadow transition-colors hover:bg-accent-dark"
                >
                  Apply Now
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Keyed by open state so each open starts a fresh application form. */}
      <ApplyModal
        key={applyOpen ? "open" : "closed"}
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        positions={positionTitles}
        initialPosition={chosen ? pick(chosen.title_en, chosen.title_my) : undefined}
      />
    </>
  );
}
