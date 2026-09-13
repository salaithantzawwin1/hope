"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { fetchSiteContent } from "@/lib/db";
import { REGISTRATION_EMAIL } from "@/lib/registration";
import type { RegisterContent, RegisterStep } from "@/lib/types";

const KEY = "register_content";

function parseJson<T>(raw: string | undefined): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Loads the admin-editable Register page content (site_content key
 * `register_content`). Spread over the fallback so a block saved by an older
 * version of the portal still renders every field, and so the contact address
 * keeps the built-in default until staff change it.
 */
function useRegister(fallback: RegisterContent): RegisterContent {
  const [data, setData] = useState<RegisterContent | null>(null);
  useEffect(() => {
    let active = true;
    fetchSiteContent().then((map) => {
      if (!active) return;
      setData(parseJson<RegisterContent>(map[KEY]?.en));
    });
    return () => {
      active = false;
    };
  }, []);
  const merged = { ...fallback, ...(data ?? {}) };
  return merged.contact_email?.trim()
    ? merged
    : { ...merged, contact_email: REGISTRATION_EMAIL };
}

/**
 * The address the registration flow points visitors at. Exported separately
 * because the form's own error notices show it too — one saved value drives
 * both, so they cannot drift apart (they used to be a hardcoded constant).
 */
export function useRegisterEmail(): string {
  const [email, setEmail] = useState(REGISTRATION_EMAIL);
  useEffect(() => {
    let active = true;
    fetchSiteContent().then((map) => {
      if (!active) return;
      const saved = parseJson<RegisterContent>(map[KEY]?.en)?.contact_email?.trim();
      if (saved) setEmail(saved);
    });
    return () => {
      active = false;
    };
  }, []);
  return email;
}

/**
 * Client-side renderers for the Register page's editable sections. The server
 * component passes the message-catalog values as `fallback`; once staff save
 * the block in the admin portal (Register tab) these render instead.
 * (Separate named exports — a server component cannot reach through property
 * access on a client-module import.)
 */

/** The intro paragraph inside the dark PageHeader banner. */
export function RegisterIntro({
  fallback,
}: {
  fallback: Pick<RegisterContent, "intro_en" | "intro_my">;
}) {
  const locale = useLocale();
  const [data, setData] = useState<RegisterContent | null>(null);
  useEffect(() => {
    let active = true;
    fetchSiteContent().then((map) => {
      if (!active) return;
      setData(parseJson<RegisterContent>(map[KEY]?.en));
    });
    return () => {
      active = false;
    };
  }, []);
  const isMy = locale === "my";
  const intro =
    isMy && data?.intro_my?.trim()
      ? data.intro_my
      : (data?.intro_en ?? fallback.intro_en);

  return (
    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200">
      {intro}
    </p>
  );
}

/** The \"What happens next?\" steps. */
export function RegisterSteps({
  fallback,
}: {
  fallback: RegisterContent;
}) {
  const locale = useLocale();
  const data = useRegister(fallback);
  const isMy = locale === "my";
  const pick = (en: string, my: string) => (isMy && my.trim() ? my : en || "");
  const step = (s: RegisterStep) => ({
    title: pick(s.title_en, s.title_my),
    desc: pick(s.desc_en, s.desc_my),
  });

  return (
    <section className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
      <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
        {pick(data.steps_title_en, data.steps_title_my)}
      </h2>
      <ol className="mt-8 grid gap-5 sm:grid-cols-3">
        {data.steps.map((item, i) => {
          const { title, desc } = step(item);
          return (
            <li
              key={i}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-base font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-bold leading-snug text-slate-900">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {desc}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** The \"Questions?\" card beside the form. */
export function RegisterContactBox({
  fallback,
}: {
  fallback: RegisterContent;
}) {
  const locale = useLocale();
  const data = useRegister(fallback);
  const isMy = locale === "my";
  const pick = (en: string, my: string) => (isMy && my.trim() ? my : en || "");

  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-lg font-bold text-slate-900">
        {pick(data.questions_title_en, data.questions_title_my)}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {pick(data.questions_text_en, data.questions_text_my)}
      </p>
      <a
        href={`mailto:${data.contact_email}`}
        className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        {data.contact_email}
      </a>
    </aside>
  );
}
