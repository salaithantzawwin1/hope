"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fetchSiteContent } from "@/lib/db";
import { FALLBACK_FOOTER } from "@/lib/fallback-data";
import { isUnknownInternalPath } from "@/lib/routes";
import type { FooterContent } from "@/lib/types";
import { useSettings } from "./useSettings";

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
  // School wordmark + footer logo are editable in the admin Settings tab.
  const settings = useSettings();
  const isMy = locale === "my";
  const schoolName = (isMy && settings.school_name_my.trim()) || settings.school_name_en;
  const schoolTagline =
    (isMy && settings.school_tagline_my.trim()) || settings.school_tagline_en;

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
  // portal → Footer tab. A saved row wins, but a field left blank inside it
  // does not: rows saved before a field existed store "" for it, and a plain
  // spread would then hide the built-in default (the tagline shipped empty on
  // the live site for exactly that reason). Links are the exception — an
  // empty list is a deliberate "hide this row".
  const saved = (value: string | undefined, fallback: string) =>
    value?.trim() ? value : fallback;
  const data: FooterContent = {
    tagline_en: saved(db?.tagline_en, FALLBACK_FOOTER.tagline_en),
    tagline_my: saved(db?.tagline_my, FALLBACK_FOOTER.tagline_my),
    address_en: saved(db?.address_en, FALLBACK_FOOTER.address_en),
    address_my: saved(db?.address_my, FALLBACK_FOOTER.address_my),
    phone_en: saved(db?.phone_en, FALLBACK_FOOTER.phone_en),
    phone_my: saved(db?.phone_my, FALLBACK_FOOTER.phone_my),
    email_en: saved(db?.email_en, FALLBACK_FOOTER.email_en),
    email_my: saved(db?.email_my, FALLBACK_FOOTER.email_my),
    hours_en: saved(db?.hours_en, FALLBACK_FOOTER.hours_en),
    hours_my: saved(db?.hours_my, FALLBACK_FOOTER.hours_my),
    links: db?.links ?? FALLBACK_FOOTER.links,
  };
  // Empty fields fall back to the English value (same rule as elsewhere).
  const pick = (en: string, my: string) => {
    const value = isMy && my.trim() ? my : en;
    return value || en;
  };

  // Quick links are edited from the Admin portal → Footer tab, same as the
  // header nav: empty rows and paths with no page behind them are dropped, so
  // a half-typed or stale link never renders (or 404s).
  const links = (data.links ?? []).filter(
    (l) =>
      l.href.trim() &&
      pick(l.label_en, l.label_my).trim() &&
      !isUnknownInternalPath(l.href),
  );

  // Compact, centered layout: tagline, quick links and the contact strip
  // stack in one centered column, but the brand lockup keeps its own line,
  // left-aligned like the wordmark in the header. The copyright sits in its
  // own slim band below. The old design was a left-aligned two-column grid
  // that stretched much taller, especially on phones.
  return (
    <footer className="mt-auto bg-brand-dark text-slate-400">
      <div className="mx-auto flex max-w-7xl 2xl:max-w-[1440px] flex-col items-center gap-2 px-4 py-5 text-center sm:px-6">
        {/* Brand row — logo + school name anchor the left edge (like the
            header wordmark), with the editable tagline as the right-hand
            counterweight on the same baseline: a letterhead/masthead look.
            Below md the tagline wraps to its own left-aligned line. */}
        <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 text-left">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.footer_logo_url || "/Logo.jpg"}
              alt={`${schoolName} ${schoolTagline} logo`}
              className="h-8 w-8 shrink-0 rounded-lg object-contain"
            />
            <div className="leading-tight">
              <div className="text-sm font-bold text-white">{schoolName}</div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                {schoolTagline}
              </div>
            </div>
          </div>
          {pick(data.tagline_en, data.tagline_my).trim() && (
            <p className="w-full text-xs leading-relaxed text-slate-400 md:ml-auto md:w-auto md:max-w-md md:text-right">
              {pick(data.tagline_en, data.tagline_my)}
            </p>
          )}
        </div>

        {/* Quick links (edited from the Admin portal → Footer). */}
        {links.length > 0 && (
          <nav
            aria-label={t("quickLinks")}
            className="flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5"
          >
            {links.map((link) => (
              <FooterLink
                key={link.href}
                href={link.href.trim()}
                className="inline-flex min-h-9 items-center rounded px-2 text-xs font-medium text-slate-400 transition-colors hover:text-white"
              >
                {pick(link.label_en, link.label_my)}
              </FooterLink>
            ))}
          </nav>
        )}

        {/* Contact strip: address + phone + email + hours in one centered,
            wrapping row — a subtle accent icon keeps each item scannable. */}
        <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-[10px]">
          <span className="flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-accent">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {pick(data.address_en, data.address_my)}
          </span>
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
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-2 text-center text-[10px] text-slate-500 sm:px-6">
          <p>
            © {new Date().getFullYear()} {schoolName} {schoolTagline}.{" "}
            {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}

/**
 * One footer quick link. Internal paths ("/", "/about") go through the
 * locale-aware Link so they keep the visitor's language; anything absolute
 * (https://, mailto:, tel:) is rendered as a plain anchor, opened in a new
 * tab only for web links.
 */
function FooterLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  const isWeb = /^https?:\/\//i.test(href);
  if (isWeb) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }
  if (/^(mailto:|tel:)/i.test(href)) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  // Root-relative paths are passed through unchanged — the locale prefix is
  // added by next-intl's Link.
  return (
    <Link href={href.startsWith("/") ? href : `/${href}`} className={className}>
      {children}
    </Link>
  );
}
