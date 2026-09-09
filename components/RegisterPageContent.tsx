"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { fetchEvents } from "@/lib/db";
import { formatDateShort } from "@/lib/format";
import { localized, type EventItem } from "@/lib/types";
import RegistrationForm from "./RegistrationForm";

/**
 * Content for the Register page. When a visitor arrives from an event
 * (e.g. /register?event=<id>), an event context card is shown above the
 * form so it is always clear what they are registering for. Direct visits
 * (no ?event=) just get the form with the events dropdown.
 */
export default function RegisterPageContent() {
  const t = useTranslations("register");
  const locale = useLocale();
  const [event, setEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    let active = true;
    fetchEvents().then((rows) => {
      if (!active) return;
      const ev = new URLSearchParams(window.location.search).get("event");
      if (!ev) return;
      setEvent(
        rows.find((e) => e.id === ev) ??
          rows.find(
            (e) => localized(e, locale, "title_en", "title_my") === ev,
          ) ??
          null,
      );
    });
    return () => {
      active = false;
    };
  }, [locale]);

  if (!event) return <RegistrationForm />;

  const title = localized(event, locale, "title_en", "title_my");
  const location = localized(event, locale, "location_en", "location_my");

  return (
    <div className="space-y-6">
      {/* Event context card */}
      <div className="rounded-2xl border border-brand/30 bg-brand/5 p-6 shadow-sm">
        <span className="inline-block w-fit rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          {t("registeringFor")}
        </span>
        <h3 className="mt-3 text-xl font-bold text-slate-900">{title}</h3>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-slate-700">
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
          <p className="mt-1 text-sm text-slate-500">📍 {location}</p>
        )}
      </div>

      <RegistrationForm />
    </div>
  );
}