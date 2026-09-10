"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { fetchSiteContent } from "@/lib/db";
import type {
  AboutCustomSection,
  AboutFacts,
  AboutMissionVision,
  AboutValues,
  WhyChoose,
} from "@/lib/types";
import { FALLBACK_WHY_CHOOSE } from "@/lib/fallback-data";

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
  sections: AboutCustomSection[];
  whyChoose: WhyChoose;
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
      const sections = parseJson<AboutCustomSection[]>(map["about_sections"]?.en);
      const whyChoose = parseJson<WhyChoose>(map["about_why_choose"]?.en);
      if (missionVision || values || facts || sections || whyChoose) {
        setDb({
          missionVision: missionVision ?? fallback.missionVision,
          values: values ?? fallback.values,
          facts: facts ?? fallback.facts,
          sections: sections ?? fallback.sections,
          whyChoose: whyChoose ?? fallback.whyChoose,
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
  const sections = data.sections;
  const why = data.whyChoose ?? FALLBACK_WHY_CHOOSE;

  // Purpose & Direction cards: Mission + Vision + any admin-added extras.
  const purposeCards = [
    {
      icon: "🎯",
      title: pick(mv.mission_title_en, mv.mission_title_my),
      text: pick(mv.mission_text_en, mv.mission_text_my),
      accent: false,
    },
    {
      icon: "🔭",
      title: pick(mv.vision_title_en, mv.vision_title_my),
      text: pick(mv.vision_text_en, mv.vision_text_my),
      accent: true,
    },
    ...(mv.extra_cards ?? []).map((card, i) => ({
      icon: card.icon.trim() || "✨",
      title: pick(card.title_en, card.title_my),
      text: pick(card.text_en, card.text_my),
      accent: (i + 2) % 2 === 1,
    })),
  ];
  // Desktop widens the grid as cards are added: 2 → 3 → 4 across.
  const purposeCols =
    purposeCards.length >= 4
      ? "lg:grid-cols-4"
      : purposeCards.length === 3
        ? "lg:grid-cols-3"
        : "";

  return (
    <>
      {/* Mission, vision and extra purpose cards */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
          {t("purposeEyebrow")}
        </p>
        <div
          className={`mt-6 grid gap-5 sm:grid-cols-2 ${purposeCols}`}
        >
          {purposeCards.map((card, i) => (
            <article
              key={i}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                aria-hidden
                className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl transition-colors duration-300 ${
                  card.accent
                    ? "bg-accent/10 group-hover:bg-accent/20"
                    : "bg-brand/10 group-hover:bg-brand/20"
                }`}
              />
              <div
                aria-hidden
                className={`absolute inset-x-0 top-0 h-1 ${
                  card.accent
                    ? "bg-gradient-to-r from-accent to-accent-dark"
                    : "bg-gradient-to-r from-brand to-brand-light"
                }`}
              />
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-md transition-transform duration-300 group-hover:scale-110 ${
                    card.accent
                      ? "bg-gradient-to-br from-accent to-accent-dark"
                      : "bg-gradient-to-br from-brand to-brand-light"
                  }`}
                >
                  <span aria-hidden>{card.icon}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  {card.title}
                </h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                {card.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Extra admin-added sections (two-card blocks like Mission & Vision) */}
      {sections.map((section, si) => (
        <section
          key={si}
          className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6"
        >
          {(section.eyebrow_en.trim() || section.eyebrow_my.trim()) && (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              {pick(section.eyebrow_en, section.eyebrow_my)}
            </p>
          )}
          {section.title_en.trim() || section.title_my.trim() ? (
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              {pick(section.title_en, section.title_my)}
            </h2>
          ) : null}
          <div
            className={`grid gap-5 md:grid-cols-2 ${
              section.title_en.trim() || section.title_my.trim() ? "mt-10" : "mt-6"
            }`}
          >
            {section.cards.map((card, ci) => (
              <article
                key={ci}
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl transition-colors duration-300 ${
                    ci % 2 === 0
                      ? "bg-brand/10 group-hover:bg-brand/20"
                      : "bg-accent/10 group-hover:bg-accent/20"
                  }`}
                />
                <div
                  aria-hidden
                  className={`absolute inset-x-0 top-0 h-1 ${
                    ci % 2 === 0
                      ? "bg-gradient-to-r from-brand to-brand-light"
                      : "bg-gradient-to-r from-accent to-accent-dark"
                  }`}
                />
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-md transition-transform duration-300 group-hover:scale-110 ${
                      ci % 2 === 0
                        ? "bg-gradient-to-br from-brand to-brand-light"
                        : "bg-gradient-to-br from-accent to-accent-dark"
                    }`}
                  >
                    <span aria-hidden>{card.icon.trim() || "✨"}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                    {pick(card.title_en, card.title_my)}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  {pick(card.text_en, card.text_my)}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}

      {/* Why Choose Hope? (dark band) */}
      <section className="relative overflow-hidden bg-brand-dark text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-brand-light/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold text-accent sm:text-3xl">
            {pick(why.title_en, why.title_my)}
          </h2>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {why.items.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl">
                  <span aria-hidden>{item.icon.trim() || "✨"}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-accent">
                    {pick(item.title_en, item.title_my)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">
                    {pick(item.text_en, item.text_my)}
                  </p>
                </div>
              </div>
            ))}
          </div>
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