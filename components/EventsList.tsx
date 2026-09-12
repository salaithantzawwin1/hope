"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatDateShort, monthShort } from "@/lib/format";
import { localized, type EventItem } from "@/lib/types";

/** Thumbnail that removes itself from view if the image fails to load. */
function EventThumb({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    // Images may already have failed in the prerendered HTML, before React
    // attached the onError handler — catch those on mount.
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) return null;

  return (
    <a
      href={src}
      target="_blank"
      rel="noreferrer"
      className="shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm transition-transform hover:scale-105"
      aria-label={title}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={src}
        alt={title}
        loading="lazy"
        className="h-20 w-16 object-cover"
        onError={() => setFailed(true)}
      />
    </a>
  );
}

export default function EventsList({
  events,
  onDetails,
  loading = false,
}: {
  events: EventItem[];
  /** When given, events with a description/flyer get a "Read More" button. */
  onDetails?: (event: EventItem) => void;
  /** True while the list is being fetched — shows a skeleton, not "No events". */
  loading?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("nav");
  const news = useTranslations("news");
  const common = useTranslations("common");

  if (loading) {
    return (
      <ul className="space-y-3" aria-hidden>
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-slate-200/70" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200/70" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200/70" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (events.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
        {news("noEvents")}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {events.map((event) => {
        const title = localized(event, locale, "title_en", "title_my");
        const location = localized(
          event,
          locale,
          "location_en",
          "location_my",
        );
        const date = new Date(`${event.date}T00:00:00`);
        const day = Number.isNaN(date.getTime()) ? event.date.slice(8) : date.getDate();
        const month = Number.isNaN(date.getTime()) ? "" : monthShort(event.date, locale);
        const hasMore =
          Boolean(localized(event, locale, "description_en", "description_my").trim()) ||
          Boolean(event.image_url);

        return (
          <li
            key={event.id}
            className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-900/5 transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md"
          >
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand text-white shadow-sm">
              <span className="text-lg font-bold leading-none">{day}</span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/85">
                {month}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold leading-snug text-slate-900 transition-colors group-hover:text-brand">
                {title}
              </h4>
              <p className="mt-1 text-sm text-slate-600">
                {formatDateShort(event.date, locale)}
                {event.time ? ` · ${event.time}` : ""}
              </p>
              {location && (
                <p className="mt-0.5 text-sm text-slate-500">📍 {location}</p>
              )}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <Link
                  href={`/register?event=${event.id}`}
                  className="rounded-lg border border-brand px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
                >
                  {t("register")}
                </Link>
                {onDetails && hasMore && (
                  <button
                    type="button"
                    onClick={() => onDetails(event)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand transition-colors hover:text-brand-dark"
                  >
                    {common("readMore")}
                    <span
                      aria-hidden
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </button>
                )}
              </div>
            </div>
            {event.image_url && <EventThumb src={event.image_url} title={title} />}
          </li>
        );
      })}
    </ul>
  );
}