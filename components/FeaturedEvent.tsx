"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fetchEvents } from "@/lib/db";
import { formatDateShort } from "@/lib/format";
import { localized, type EventItem } from "@/lib/types";

/**
 * Highlights the next upcoming event that has a flyer/poster image.
 * Renders nothing when no event has an image yet, so pages stay clean.
 */
export default function FeaturedEvent() {
  const t = useTranslations("home");
  const locale = useLocale();
  const [event, setEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    let active = true;
    fetchEvents().then((rows) => {
      if (!active) return;
      const today = new Date().toISOString().slice(0, 10);
      // Prefer the soonest upcoming event that carries a flyer image.
      // Past events are never featured, even if they still have a flyer.
      setEvent(
        rows.find((e) => e.image_url && e.date >= today) ?? null,
      );
    });
    return () => {
      active = false;
    };
  }, []);

  if (!event || !event.image_url) return null;

  const title = localized(event, locale, "title_en", "title_my");
  const location = localized(event, locale, "location_en", "location_my");
  const description = localized(
    event,
    locale,
    "description_en",
    "description_my",
  );

  return (
    <section className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-16 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid md:grid-cols-[2fr_3fr]">
          {/* Flyer */}
          <a
            href={event.image_url}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-center bg-slate-100 p-6 sm:p-8"
            aria-label={title}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.image_url}
              alt={title}
              loading="lazy"
              className="max-h-[440px] w-auto max-w-full rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </a>

          {/* Details */}
          <div className="flex flex-col justify-center p-6 sm:p-10">
            <span className="inline-block w-fit rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-dark">
              {t("featuredEvent")}
            </span>
            <h2 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              {title}
            </h2>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-700">
              <span aria-hidden>📅</span>
              <span>{formatDateShort(event.date, locale)}</span>
              {event.time && (
                <>
                  <span aria-hidden>🕐</span>
                  <span>{event.time}</span>
                </>
              )}
            </div>
            {location && (
              <p className="mt-2 text-sm text-slate-500">📍 {location}</p>
            )}
            {description && (
              <p className="mt-4 leading-relaxed text-slate-600">
                {description}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/register?event=${event.id}`}
                className="inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                {t("featuredRegister")}
              </Link>
              <a
                href={event.image_url}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-xl border border-brand px-5 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand/5"
              >
                {t("featuredCta")} ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}