"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { fetchSiteContent } from "@/lib/db";
import type {
  AboutFacts,
  AboutMissionVision,
  AboutValues,
} from "@/lib/types";

const VALUE_ICONS = ["🤝", "⚖️", "🌟", "🏘️"];

function parseJson<T>(raw: string | undefined): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

interface AboutData {
  missionVision: AboutMissionVision;
  values: AboutValues;
  facts: AboutFacts;
}

/**
 * Renders the About page sections (mission & vision, core values, school
 * facts) from the `site_content` table, which staff edit in the admin
 * portal. Each section is stored as JSON in a single site_content row;
 * until a row exists the `fallback` prop (from the message catalogs) is
 * shown.
 */
export default function AboutContent({ fallback }: { fallback: AboutData }) {
  const locale = useLocale();
  const t = useTranslations("about");
  const [db, setDb] = useState<AboutData | null>(null);

  useEffect(() => {
    let active = true;
    fetchSiteContent().then((map) => {
      if (!active) return;
      const missionVision = parseJson<AboutMissionVision>(
        map["about_mission_vision"]?.en,
      );
      const values = parseJson<AboutValues>(map["about_values"]?.en);
      const facts = parseJson<AboutFacts>(map["about_facts"]?.en);
      if (missionVision || values || facts) {
        setDb({
          missionVision: missionVision ?? fallback.missionVision,
          values: values ?? fallback.values,
          facts: facts ?? fallback.facts,
        });
      }
    });
    return () => {
      active = false;
    };
  }, [fallback]);

  const data = db ?? fallback;
  const isMy = locale === "my";
  // Empty fields fall back to the English value (same rule as SiteText).
  const pick = (en: string, my: string) => {
    const value = isMy && my.trim() ? my : en;
    return value || en;
  };

  const mv = data.missionVision;
  const values = data.values;
  const facts = data.facts;

  return (
    <>
      {/* Mission & vision */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
          {t("purposeEyebrow")}
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Mission */}
          <article className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-brand/10 blur-2xl transition-colors duration-300 group-hover:bg-brand/20"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand to-brand-light"
            />
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-light text-2xl shadow-md transition-transform duration-300 group-hover:scale-110">
                <span aria-hidden>🎯</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                {pick(mv.mission_title_en, mv.mission_title_my)}
              </h2>
            </div>
            <p className="mt-5 text-base leading-relaxed text-slate-600 lg:text-lg">
              {pick(mv.mission_text_en, mv.mission_text_my)}
            </p>
          </article>

          {/* Vision */}
          <article className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent/10 blur-2xl transition-colors duration-300 group-hover:bg-accent/20"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-accent to-accent-dark"
            />
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-dark text-2xl shadow-md transition-transform duration-300 group-hover:scale-110">
                <span aria-hidden>🔭</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                {pick(mv.vision_title_en, mv.vision_title_my)}
              </h2>
            </div>
            <p className="mt-5 text-base leading-relaxed text-slate-600 lg:text-lg">
              {pick(mv.vision_text_en, mv.vision_text_my)}
            </p>
          </article>
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-dark">
            {t("valuesEyebrow")}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            {pick(values.title_en, values.title_my)}
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.values.map((value, i) => (
              <article
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
              >
                <span
                  aria-hidden
                  className="absolute right-4 top-4 text-3xl font-extrabold tabular-nums text-slate-100 transition-colors duration-300 group-hover:text-brand/20"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl shadow-sm transition-transform duration-300 group-hover:scale-110 ${
                    i % 2 === 0
                      ? "bg-gradient-to-br from-brand to-brand-light"
                      : "bg-gradient-to-br from-accent to-accent-dark"
                  }`}
                >
                  <span aria-hidden>{VALUE_ICONS[i % VALUE_ICONS.length]}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {pick(value.title_en, value.title_my)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {pick(value.desc_en, value.desc_my)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Facts */}
      <section className="relative overflow-hidden bg-brand-light text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-0 h-56 w-56 rounded-full bg-accent/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-brand-dark/40 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-14 sm:px-6">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-accent">
            {t("factsEyebrow")}
          </p>
          <h2 className="mt-2 text-center text-2xl font-bold sm:text-3xl">
            {pick(facts.title_en, facts.title_my)}
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:divide-x lg:divide-white/10">
            {facts.facts.map((fact, i) => (
              <div key={i} className="px-4 text-center">
                <div className="bg-gradient-to-r from-accent via-amber-200 to-accent bg-clip-text text-4xl font-extrabold tabular-nums text-transparent">
                  {pick(fact.number_en, fact.number_my)}
                </div>
                <div className="mt-2 text-sm text-slate-100">
                  {pick(fact.label_en, fact.label_my)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}