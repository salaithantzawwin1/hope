"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatDateShort, monthShort } from "@/lib/format";
import { localized, type EventItem } from "@/lib/types";

export default function EventsList({
  events,
  onDetails,
}: {
  events: EventItem[];
  /** When given, events with a description/flyer get a "Read More" button. */
  onDetails?: (event: EventItem) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("nav");
  const news = useTranslations("news");
  const common = useTranslations("common");

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
            className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand text-white">
              <span className="text-lg font-bold leading-none">{day}</span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
                {month}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold leading-snug text-slate-900">
                {title}
              </h4>
              <p className="mt-1 text-sm text-slate-600">
                {formatDateShort(event.date, locale)}
                {event.time ? ` · ${event.time}` : ""}
              </p>
              {location && (
                <p className="mt-0.5 text-sm text-slate-500">📍 {location}</p>
              )}
              <Link
                href={`/register?event=${event.id}`}
                className="mt-2 inline-block rounded-lg border border-brand px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
              >
                {t("register")}
              </Link>
              {onDetails && hasMore && (
                <button
                  type="button"
                  onClick={() => onDetails(event)}
                  className="mt-1.5 block text-sm font-semibold text-brand transition-colors hover:text-brand-dark hover:underline"
                >
                  {common("readMore")} →
                </button>
              )}
            </div>
            {event.image_url && (
              <a
                href={event.image_url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 overflow-hidden rounded-lg border border-slate-200 shadow-sm transition-transform hover:scale-105"
                aria-label={title}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.image_url}
                  alt={title}
                  loading="lazy"
                  className="h-20 w-16 object-cover"
                />
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}