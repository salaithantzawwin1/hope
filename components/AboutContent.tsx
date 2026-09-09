"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
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
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border-t-4 border-accent bg-cream p-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden>🎯</span>
              <h2 className="text-xl font-bold text-slate-900">
                {pick(mv.mission_title_en, mv.mission_title_my)}
              </h2>
            </div>
            <p className="mt-4 leading-relaxed text-slate-600">
              {pick(mv.mission_text_en, mv.mission_text_my)}
            </p>
          </div>
          <div className="rounded-3xl border-t-4 border-brand bg-cream p-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden>🔭</span>
              <h2 className="text-xl font-bold text-slate-900">
                {pick(mv.vision_title_en, mv.vision_title_my)}
              </h2>
            </div>
            <p className="mt-4 leading-relaxed text-slate-600">
              {pick(mv.vision_text_en, mv.vision_text_my)}
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900">
            {pick(values.title_en, values.title_my)}
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.values.map((value, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-xl font-bold text-brand">
                  {VALUE_ICONS[i % VALUE_ICONS.length]}
                </div>
                <h3 className="mt-4 font-bold text-slate-900">
                  {pick(value.title_en, value.title_my)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {pick(value.desc_en, value.desc_my)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facts */}
      <section className="bg-brand-light text-white">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-14 sm:px-6">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            {pick(facts.title_en, facts.title_my)}
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {facts.facts.map((fact, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center"
              >
                <div className="text-3xl font-bold text-accent">
                  {pick(fact.number_en, fact.number_my)}
                </div>
                <div className="mt-1.5 text-sm text-slate-100">
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