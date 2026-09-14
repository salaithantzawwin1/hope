"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { fetchSiteContent } from "@/lib/db";
import { FALLBACK_HEADER } from "@/lib/fallback-data";
import { isUnknownInternalPath } from "@/lib/routes";
import type { HeaderContent, NavLink } from "@/lib/types";
import { useSettings } from "./useSettings";

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
  // School wordmark is editable in the admin Settings tab (defaults keep
  // the built-in "Hope / International School" until staff change it).
  const settings = useSettings();
  const isMy = locale === "my";
  const schoolName = (isMy && settings.school_name_my.trim()) || settings.school_name_en;
  const schoolTagline =
    (isMy && settings.school_tagline_my.trim()) || settings.school_tagline_en;

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
  // tab.
  //
  // A saved menu is authoritative — add, relabel, reorder and remove all work
  // from the portal. It used to be rebuilt from FALLBACK_HEADER.links, which
  // meant a link staff added was dropped and a link they removed came back;
  // only relabelling ever had an effect. The fallback menu is used when no row
  // has been saved yet, and it also supplies the label for a saved link whose
  // own labels were left blank.
  const fallbackByHref = new Map(FALLBACK_HEADER.links.map((l) => [l.href, l]));
  const savedLinks = db?.links?.length ? db.links : FALLBACK_HEADER.links;
  const data: HeaderContent = {
    logo_url: db?.logo_url?.trim() ? db.logo_url : FALLBACK_HEADER.logo_url,
    links: savedLinks.map((l): NavLink => {
      const known = fallbackByHref.get(l.href);
      return {
        href: l.href,
        label_en: l.label_en.trim() || known?.label_en || "",
        label_my: l.label_my.trim() || known?.label_my || "",
      };
    }),
  };
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
  // Empty rows, links with no label at all and paths with no page behind them
  // are dropped rather than rendered as a dead end.
  const links = (data.links ?? FALLBACK_HEADER.links).filter(
    (l) =>
      l.href.trim() &&
      pick(l.label_en, l.label_my).trim() &&
      !isUnknownInternalPath(l.href),
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
              {schoolName}
            </span>
            <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500">
              {schoolTagline}
            </span>
          </span>
        </Link>

        {/* Desktop nav — only from xl (1280px) up: with 7 links plus the
            locale switcher and CTA the row needs ~1100px, so at lg (1024px
            laptops) it overflows. Below xl the hamburger menu is used.
            Slightly denser at xl, roomier from 2xl. */}
        <nav className="hidden items-center gap-0.5 xl:flex 2xl:gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition-colors 2xl:px-3 ${
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
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-brand hover:text-brand"
        >
          {otherLabel}
        </a>

          <Link
            href="/admissions"
            className="hidden rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark sm:block"
          >
            {t("admissions")}
          </Link>

          {/* Mobile menu button (shown below xl — see desktop nav note) */}
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 xl:hidden"
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

      {/* Mobile / tablet nav — a capped, scrollable sheet so 7+ links plus
          the CTA never push the page content down on small screens. */}
      {open && (
        <nav className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-slate-100 bg-white px-4 pb-4 pt-2 xl:hidden">
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