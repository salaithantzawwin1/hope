"use client";

import { useLocale } from "next-intl";
import { formatDateShort, monthShort } from "@/lib/format";
import { localized, type EventItem } from "@/lib/types";

export default function EventsList({ events }: { events: EventItem[] }) {
  const locale = useLocale();

  if (events.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
        —
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
            <div className="min-w-0">
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
            </div>
          </li>
        );
      })}
    </ul>
  );
}