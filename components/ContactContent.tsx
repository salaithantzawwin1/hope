"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { fetchSiteContent } from "@/lib/db";
import { FALLBACK_CONTACT } from "@/lib/fallback-data";
import type { ContactContent } from "@/lib/types";

function parseJson<T>(raw: string | undefined): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Inline brand icons for the social channels (single-colour, currentColor). */
function SocialIcon({ kind }: { kind: string }) {
  switch (kind) {
    case "facebook":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M13.5 21v-7h2.6l.4-3h-3V9.1c0-.9.3-1.5 1.6-1.5H17V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4V11H8v3h2.6v7h2.9z" />
        </svg>
      );
    case "telegram":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21.6 4.4c.3-1.1-.7-1.9-1.6-1.5L2.7 9.7c-1.1.4-1 1.9 0 2.3l4.4 1.4 1.7 5.3c.3.9 1.4 1.1 2 .4l2.5-2.4 4.5 3.3c.8.6 1.9.2 2.1-.8l1.7-14.8zM8.6 12.9l9.4-6.1c.3-.2.5.2.3.4l-7.6 7.2-.3 3.2-1.8-4.7z" />
        </svg>
      );
    case "viber":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 1.5c-2.7 0-5.6.3-7.6 2.2C2.7 5.4 2.2 7.4 2.1 9.4c-.1 1.7-.2 3.6.5 5.2.4.9 1 1.7 1.7 2.4.3.3.7.6 1 .9v2.9c0 .5.6.9 1.1.6l3-1.7c.9.2 1.8.3 2.7.3 2.7 0 5.6-.3 7.6-2.2 1.7-1.7 2.2-3.7 2.3-5.7.1-1.7.2-3.6-.5-5.2-.4-.9-1-1.7-1.7-2.4C18.6 2.4 18 2 17.4 1.7 15.9 1.1 13.9 1.5 12 1.5zm0 1.7c1.7 0 3.6.2 4.9 1.4 1.3 1.2 1.6 3 1.6 4.7 0 1.6 0 3.3-1.2 4.5-1.5 1.4-3.7 1.5-5.6 1.5-.7 0-1.5-.1-2.2-.2l-2.4 1.4v-2.3l-1.3-1.2c-.6-.6-1.1-1.2-1.4-2-.5-1.3-.4-2.9-.3-4.2.1-1.6.5-3.1 1.6-4.2C6.9 3.5 9.6 3.2 12 3.2zm-2.3 3c-.2-.5-.5-.5-.8-.5-.4 0-.9.1-1.3.6-.5.5-.9 1.2-.8 2 .1.6.4 1.2.8 1.8.6 1 1.4 2 2.5 2.8.9.7 2 1.3 3.2 1.4.8.1 1.6-.4 2-1 .3-.4.3-.9.1-1.2-.1-.2-.3-.3-.5-.4l-1.5-.7c-.2-.1-.4-.1-.6.1l-.6.7c-.1.2-.4.2-.6.1-.6-.3-1.2-.7-1.6-1.2-.4-.4-.7-.9-1-1.4-.1-.2-.1-.4.1-.6l.5-.5c.2-.2.2-.4.1-.6L9.7 6.2z" />
        </svg>
      );
    default:
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
        </svg>
      );
  }
}

/** Brand colours per channel (used for the small icon chip). */
const SOCIAL_COLORS: Record<string, string> = {
  facebook: "bg-[#1877F2]",
  telegram: "bg-[#229ED9]",
  viber: "bg-[#7360F2]",
};

/**
 * Renders the Contact page (hero, contact info cards, social links and the
 * Google Maps embed) from the `site_content` table, edited in the admin
 * portal. Until a row exists, `FALLBACK_CONTACT` is shown.
 */
export default function ContactContent() {
  const locale = useLocale();
  const [db, setDb] = useState<ContactContent | null>(null);
  const isMy = locale === "my";
  const pick = (en: string, my: string) => (isMy && my.trim() ? my : en || my || en);
  const data = db ?? FALLBACK_CONTACT;

  useEffect(() => {
    let active = true;
    fetchSiteContent().then((map) => {
      if (!active) return;
      const parsed = parseJson<ContactContent>(map["contact_content"]?.en);
      if (parsed) setDb({ ...FALLBACK_CONTACT, ...parsed });
    });
    return () => {
      active = false;
    };
  }, []);

  const socials = (data.socials ?? []).filter((s) => s.href.trim());
  const cards = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      title: pick(data.address_title_en, data.address_title_my),
      lines: pick(data.address_en, data.address_my),
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pick(data.address_en, data.address_my))}`,
      linkLabel: isMy ? "မြေပုံတွင် ကြည့်ရန်" : "View on map",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1L8 10a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7a2 2 0 011.7 2z" />
        </svg>
      ),
      title: pick(data.phone_title_en, data.phone_title_my),
      lines: pick(data.phone_en, data.phone_my),
      href: `tel:${pick(data.phone_en, data.phone_my).replace(/[^+\d]/g, "")}`,
      linkLabel: isMy ? "ဖုန်းခေါ်ရန်" : "Call now",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 7l-10 6L2 7" />
        </svg>
      ),
      title: pick(data.email_title_en, data.email_title_my),
      lines: pick(data.email_en, data.email_my),
      href: `mailto:${pick(data.email_en, data.email_my)}`,
      linkLabel: isMy ? "အီးမေးလ်ပို့ရန်" : "Send email",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      title: pick(data.hours_title_en, data.hours_title_my),
      lines: pick(data.hours_en, data.hours_my),
      href: null,
      linkLabel: null,
    },
  ];

  return (
    <>
      {/* Hero — matches the Carrier hero treatment (gradient + pill badge). */}
      <section className="relative overflow-hidden bg-brand-dark text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand to-brand-light opacity-90" />
        <div className="relative mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-accent">
              {isMy ? "Hope အပြည်ပြည်ဆိုင်ရာ ကျောင်း" : "Hope International School"}
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {pick(data.hero_title_en, data.hero_title_my)}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-200">
              {pick(data.hero_subtitle_en, data.hero_subtitle_my)}
            </p>
          </div>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => (
            <div
              key={i}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                {card.icon}
              </span>
              <h2 className="mt-4 text-base font-bold text-slate-900">
                {card.title}
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {card.lines}
              </p>
              {card.href && (
                <a
                  href={card.href}
                  target={card.href.startsWith("http") ? "_blank" : undefined}
                  rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="mt-auto inline-block pt-4 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
                >
                  {card.linkLabel} →
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Social channels */}
        {socials.length > 0 && (
          <div className="mt-10 rounded-3xl bg-cream p-6 sm:p-8">
            <h2 className="text-center text-lg font-bold text-slate-900 sm:text-xl">
              {isMy ? "လူမှုကွန်ရက်များတွင် ဆက်သွယ်ပါ" : "Connect with us"}
            </h2>
            <p className="mt-1.5 text-center text-sm text-slate-500">
              {isMy
                ? "နောက်ဆုံးရ သတင်းများနှင့် ဆက်သွယ်ရန် လိုက်နာပါ"
                : "Follow us or message us on your favourite channel"}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              {socials.map((social, i) => {
                const label = pick(social.label_en, social.label_my);
                const external = social.href.startsWith("http");
                return (
                  <a
                    key={i}
                    href={social.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    aria-label={label}
                    title={label}
                    className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white py-2.5 pl-2.5 pr-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm ${
                        SOCIAL_COLORS[social.kind] ?? "bg-brand"
                      }`}
                    >
                      <SocialIcon kind={social.kind} />
                    </span>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-brand">
                      {label}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Google Map */}
      {data.map_embed_url.trim() && (
        <section className="mx-auto mb-16 max-w-7xl 2xl:max-w-[1440px] px-4 sm:px-6">
          {pick(data.map_title_en, data.map_title_my) && (
            <h2 className="mb-5 text-lg font-bold text-slate-900 sm:text-xl">
              {pick(data.map_title_en, data.map_title_my)}
            </h2>
          )}
          <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
            <iframe
              src={data.map_embed_url}
              title={pick(data.map_title_en, data.map_title_my) || "School location map"}
              className="h-[420px] w-full border-0 sm:h-[480px]"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="mt-4 text-center">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pick(data.address_en, data.address_my))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {isMy ? "Google Maps တွင် ဖွင့်ရန်" : "Open in Google Maps"}
            </a>
          </div>
        </section>
      )}
    </>
  );
}
