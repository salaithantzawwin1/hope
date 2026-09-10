"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { fetchEvents, fetchNews } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { localized, type EventItem, type NewsItem } from "@/lib/types";
import EventsList from "./EventsList";
import NewsCard from "./NewsCard";
import PageHeader from "./PageHeader";

export default function NewsEventsPage() {
  const t = useTranslations("news");
  const common = useTranslations("common");
  const locale = useLocale();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selected, setSelected] = useState<NewsItem | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([fetchNews(), fetchEvents()]).then(([n, e]) => {
      if (!active) return;
      setNews(n);
      setEvents(e);
      // Open an article when arriving with ?post=<id>
      const id = new URLSearchParams(window.location.search).get("post");
      if (id) {
        const match = n.find((item) => item.id === id);
        if (match) setSelected(match);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const close = useCallback(() => setSelected(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const selectedTitle = selected
    ? localized(selected, locale, "title_en", "title_my")
    : "";
  const selectedBody = selected
    ? localized(selected, locale, "body_en", "body_my")
    : "";

  return (
    <>
      <PageHeader title={t("title")}>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200">
          {t("subtitle")}
        </p>
      </PageHeader>
      <div className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">

      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        {/* News grid */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-bold text-slate-900">{t("newsTitle")}</h2>
          {news.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
              {t("noNews")}
            </p>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {news.map((item) => (
                <NewsCard key={item.id} item={item} onRead={setSelected} />
              ))}
            </div>
          )}
        </div>

        {/* Events */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900">
            {t("eventsTitle")}
          </h2>
          <div className="mt-5">
            <EventsList events={events} />
          </div>
        </div>
      </div>

      {/* Article modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selectedTitle}
          >
            {selected.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.image_url}
                alt={selectedTitle}
                className="h-60 w-full object-cover"
              />
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-brand to-brand-light text-7xl">
                <span aria-hidden>🏫</span>
              </div>
            )}
            <div className="p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent-dark">
                {formatDate(selected.published_at, locale)}
              </p>
              <h2 className="mt-2 text-2xl font-bold leading-snug text-slate-900">
                {selectedTitle}
              </h2>
              <div className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-slate-700">
                {selectedBody}
              </div>
              <button
                type="button"
                onClick={close}
                className="mt-6 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                {common("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}