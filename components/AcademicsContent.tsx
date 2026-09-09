"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { fetchSiteContent } from "@/lib/db";
import type {
  AcademicsCurriculum,
  AcademicsLevels,
  AcademicsPrograms,
} from "@/lib/types";

const LEVEL_ICONS = ["🧸", "📖", "🔬", "🎓"];

function parseJson<T>(raw: string | undefined): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

interface AcademicsData {
  curriculum: AcademicsCurriculum;
  levels: AcademicsLevels;
  programs: AcademicsPrograms;
}

/**
 * Renders the Academics page sections (curriculum, grade levels, beyond the
 * classroom) from the `site_content` table, which staff edit in the admin
 * portal. Each section is stored as JSON in a single site_content row; until
 * a row exists the `fallback` prop (from the message catalogs) is shown.
 */
export default function AcademicsContent({ fallback }: { fallback: AcademicsData }) {
  const locale = useLocale();
  const [db, setDb] = useState<AcademicsData | null>(null);

  useEffect(() => {
    let active = true;
    fetchSiteContent().then((map) => {
      if (!active) return;
      const curriculum = parseJson<AcademicsCurriculum>(map["academics_curriculum"]?.en);
      const levels = parseJson<AcademicsLevels>(map["academics_levels"]?.en);
      const programs = parseJson<AcademicsPrograms>(map["academics_programs"]?.en);
      if (curriculum || levels || programs) {
        setDb({
          curriculum: curriculum ?? fallback.curriculum,
          levels: levels ?? fallback.levels,
          programs: programs ?? fallback.programs,
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

  return (
    <>
      {/* Curriculum */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {pick(data.curriculum.title_en, data.curriculum.title_my)}
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              {pick(data.curriculum.text_en, data.curriculum.text_my)}
            </p>
            <ul className="mt-6 space-y-3">
              {(isMy ? data.curriculum.points_my : data.curriculum.points_en).map(
                (point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs text-brand">
                      ✓
                    </span>
                    <span className="text-sm leading-relaxed text-slate-700">
                      {point}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {data.levels.levels.map((level, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-lg font-bold text-brand">
                    {LEVEL_ICONS[i % LEVEL_ICONS.length]}
                  </span>
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-dark">
                    {pick(level.age_en, level.age_my)}
                  </span>
                </div>
                <h3 className="mt-4 font-bold text-slate-900">
                  {pick(level.name_en, level.name_my)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {pick(level.desc_en, level.desc_my)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beyond the classroom */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-900">
              {pick(data.programs.title_en, data.programs.title_my)}
            </h2>
            <p className="mt-3 text-slate-500">
              {pick(data.programs.subtitle_en, data.programs.subtitle_my)}
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.programs.programs.map((program, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="text-lg font-bold text-slate-900">
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
    </>
  );
}