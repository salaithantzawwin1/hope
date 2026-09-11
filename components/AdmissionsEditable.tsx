"use client";

import { useLocale } from "next-intl";
import { fetchSiteContent } from "@/lib/db";
import type { AdmissionsContent, AdmissionFee, AdmissionStep } from "@/lib/types";
import { useEffect, useState } from "react";

const KEY = "admissions_content";

function parseJson<T>(raw: string | undefined): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Loads the admin-editable Admissions content (site_content key
 * `admissions_content`). Falls back to the message catalogs until the
 * block has been saved for the first time.
 */
function useAdmissions(fallback: AdmissionsContent): AdmissionsContent {
  const [data, setData] = useState<AdmissionsContent | null>(null);
  useEffect(() => {
    let active = true;
    fetchSiteContent().then((map) => {
      if (!active) return;
      setData(parseJson<AdmissionsContent>(map[KEY]?.en));
    });
    return () => {
      active = false;
    };
  }, []);
  return data ?? fallback;
}

/**
 * Client-side renderers for the Admissions page's editable sections. The
 * server component passes the message-catalog values as `fallback`; once
 * staff save the block in the admin portal these render instead.
 * (Two separate named exports — a server component cannot reach through
 * property access on a client-module import.)
 */

/** The intro paragraph inside the dark PageHeader banner. */
export function AdmissionsIntro({
  fallback,
}: {
  fallback: Pick<AdmissionsContent, "intro_en" | "intro_my">;
}) {
  const locale = useLocale();
  const [data, setData] = useState<AdmissionsContent | null>(null);
  useEffect(() => {
    let active = true;
    fetchSiteContent().then((map) => {
      if (!active) return;
      setData(parseJson<AdmissionsContent>(map[KEY]?.en));
    });
    return () => {
      active = false;
    };
  }, []);
  const isMy = locale === "my";
  const intro =
    isMy && data?.intro_my?.trim() ? data.intro_my : (data?.intro_en ?? fallback.intro_en);
  return (
    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200">{intro}</p>
  );
}

/** Steps, required documents and fees sections. */
export function AdmissionsSections({
  fallback,
}: {
  fallback: AdmissionsContent;
}) {
  const locale = useLocale();
  const data = useAdmissions(fallback);
  const isMy = locale === "my";

  /** Burmese when non-empty, else English — same rule as the other blocks. */
  const pick = (en: string, my: string) => (isMy && my?.trim() ? my : en || "");
  const stepTitle = (s: AdmissionStep) => pick(s.title_en, s.title_my);
  const stepDesc = (s: AdmissionStep) => pick(s.desc_en, s.desc_my);
  const feeLevel = (f: AdmissionFee) => pick(f.level_en, f.level_my);
  const feeAmount = (f: AdmissionFee) => pick(f.fee_en, f.fee_my);
  const requirement = (i: number) =>
    pick(data.requirements_en[i] ?? "", data.requirements_my[i] ?? "");

  return (
    <>
      {/* Steps */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {pick(data.steps_title_en, data.steps_title_my)}
        </h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {data.steps.map((step, i) => (
            <li
              key={i}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-base font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-bold leading-snug text-slate-900">
                {stepTitle(step)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {stepDesc(step)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Requirements + fees */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              {pick(data.requirements_title_en, data.requirements_title_my)}
            </h2>
            <ul className="mt-5 space-y-3">
              {data.requirements_en.map((_, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs text-brand">
                    ✓
                  </span>
                  <span className="text-sm leading-relaxed text-slate-700">
                    {requirement(i)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              {pick(data.fees_title_en, data.fees_title_my)}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {pick(data.fees_subtitle_en, data.fees_subtitle_my)}
            </p>
            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-brand text-white">
                    <th className="px-4 py-3 font-semibold">
                      {isMy ? "အစီအစဉ်" : "Programme"}
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      {isMy ? "နှစ်စဉ် ကျောင်းလခ" : "Annual Tuition"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.fees.map((row, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {feeLevel(row)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {feeAmount(row)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              {pick(data.fees_note_en, data.fees_note_my)}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
