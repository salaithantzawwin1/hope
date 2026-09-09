"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fetchSiteContent } from "@/lib/db";
import { FALLBACK_FOOTER } from "@/lib/fallback-data";
import type { FooterContent } from "@/lib/types";

function parseJson<T>(raw: string | undefined): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const [db, setDb] = useState<FooterContent | null>(null);

  useEffect(() => {
    let active = true;
    fetchSiteContent().then((map) => {
      if (!active) return;
      setDb(parseJson<FooterContent>(map["footer_content"]?.en));
    });
    return () => {
      active = false;
    };
  }, []);

  // The tagline, contact details and quick links are edited from the Admin
  // portal → Footer tab. Until a row exists — or for fields missing from an
  // older saved row — the fallback defaults are shown.
  const data = { ...FALLBACK_FOOTER, ...(db ?? {}) };
  const isMy = locale === "my";
  // Empty fields fall back to the English value (same rule as elsewhere).
  const pick = (en: string, my: string) => {
    const value = isMy && my.trim() ? my : en;
    return value || en;
  };

  // Quick links are also edited from the Footer tab; rows without a href or
  // label are skipped.
  const links = (data.links ?? FALLBACK_FOOTER.links).filter(
    (l) => l.href.trim() && pick(l.label_en, l.label_my).trim(),
  );

  return (
    <footer className="mt-auto bg-brand-dark text-slate-400">
      <div className="mx-auto max-w-6xl xl:max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Brand + address */}
          <div>
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Logo.jpg"
                alt="Hope International School logo"
                className="h-7 w-7 shrink-0 rounded-lg object-contain"
              />
              <div className="leading-tight">
                <div className="text-xs font-bold text-white">Hope</div>
                <div className="text-[9px] font-medium uppercase tracking-wider text-slate-500">
                  International School
                </div>
                <div className="mt-1 max-w-[220px] text-[10px] leading-snug text-slate-500">
                  {pick(data.tagline_en, data.tagline_my)}
                </div>
              </div>
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-accent">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{pick(data.address_en, data.address_my)}</span>
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-2.5 text-[11px]">
            <span className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-accent">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {pick(data.phone_en, data.phone_my)}
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-accent">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              {pick(data.email_en, data.email_my)}
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-accent">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {pick(data.hours_en, data.hours_my)}
            </span>
          </div>

          {/* Quick links */}
          <nav className="space-y-2 text-[11px]" aria-label={t("quickLinks")}>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block text-slate-400 transition-colors hover:text-accent"
              >
                {pick(l.label_en, l.label_my)}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl xl:max-w-7xl flex-col items-center justify-between gap-1 px-4 py-2 text-[10px] text-slate-500 sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()} Hope International School.{" "}
            {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}