"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { fetchSiteContent } from "@/lib/db";
import { FALLBACK_HEADER } from "@/lib/fallback-data";
import type { HeaderContent } from "@/lib/types";

function parseJson<T>(raw: string | undefined): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [db, setDb] = useState<HeaderContent | null>(null);

  useEffect(() => {
    let active = true;
    fetchSiteContent().then((map) => {
      if (!active) return;
      setDb(parseJson<HeaderContent>(map["header_content"]?.en));
    });
    return () => {
      active = false;
    };
  }, []);

  // The logo and nav menu items are edited from the Admin portal → Header
  // tab. Until a row exists — or for fields missing from an older saved row
  // — the fallback defaults are shown.
  const data = { ...FALLBACK_HEADER, ...(db ?? {}) };
  const isMy = locale === "my";
  const pick = (en: string, my: string) => {
    const value = isMy && my.trim() ? my : en;
    return value || en;
  };
  const logoUrl = data.logo_url.trim() || FALLBACK_HEADER.logo_url;

  const otherLocale = locale === "en" ? "my" : "en";
  const otherLabel = locale === "en" ? "မြန်မာ" : "English";
  // Fully-prefixed URL for the other language. Must be a plain <a> (not the
  // locale-aware Link, which would prepend the current locale again).
  const otherHref = `/${otherLocale}${pathname}`;

  // Admissions is not in the list: the prominent blue Admissions button on
  // the right (and the mobile menu CTA) already link there, so repeating it
  // in the nav only crowds the row — especially in Burmese.
  const links = (data.links ?? FALLBACK_HEADER.links).filter(
    (l) => l.href.trim() && pick(l.label_en, l.label_my).trim(),
  );

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl 2xl:max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="Hope International School logo"
            className="h-10 w-10 rounded-xl object-contain"
          />
          <span className="leading-tight">
            <span className="block text-[15px] font-bold tracking-tight text-brand">
              Hope
            </span>
            <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500">
              International School
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-brand/10 text-brand"
                  : "text-slate-600 hover:bg-slate-100 hover:text-brand"
              }`}
            >
              {pick(link.label_en, link.label_my)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">        {/* Locale switcher */}
        <a
          href={otherHref}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-brand hover:text-brand"
        >
          {otherLabel}
        </a>

          <Link
            href="/admissions"
            className="hidden rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark sm:block"
          >
            {t("admissions")}
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                isActive(link.href)
                  ? "bg-brand/10 text-brand"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {pick(link.label_en, link.label_my)}
            </Link>
          ))}
          <Link
            href="/admissions"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-lg bg-brand px-3 py-2.5 text-center text-sm font-semibold text-white"
          >
            {t("admissions")}
          </Link>
        </nav>
      )}
    </header>
  );
}