"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { fetchEvents, fetchNews } from "@/lib/db";
import { formatDate, formatDateShort } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { localized, type EventItem, type NewsItem } from "@/lib/types";
import EventsList from "./EventsList";
import NewsCard from "./NewsCard";
import PageHeader from "./PageHeader";

type Tab = "all" | "news" | "events";

/**
 * Placeholder blocks shown only while news/events load (when no prerendered
 * data was passed in) — never a premature "No news" empty state.
 */
function ListSkeleton() {
  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-5" aria-hidden>
      <div className="space-y-5 lg:col-span-3">
        <div className="h-56 animate-pulse rounded-3xl bg-slate-200/70 sm:h-72" />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="h-40 animate-pulse rounded-2xl bg-slate-200/70" />
          <div className="h-40 animate-pulse rounded-2xl bg-slate-200/70" />
        </div>
      </div>
      <div className="space-y-3 lg:col-span-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200/70" />
        ))}
      </div>
    </div>
  );
}

export default function NewsEventsPage({
  initialNews,
  initialEvents,
}: {
  /** Prerendered news (server component) — the page shows it instantly. */
  initialNews?: NewsItem[];
  /** Prerendered events (server component) — the page shows it instantly. */
  initialEvents?: EventItem[];
}) {
  const t = useTranslations("news");
  const common = useTranslations("common");
  const nav = useTranslations("nav");
  const locale = useLocale();
  // Null = still loading → renders a skeleton (never a premature "No news").
  // Starts with the prerendered data when the server passed some in.
  const [news, setNews] = useState<NewsItem[] | null>(initialNews ?? null);
  const [events, setEvents] = useState<EventItem[] | null>(initialEvents ?? null);
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [tab, setTab] = useState<Tab>("all");

  const loading = news === null || events === null;

  useEffect(() => {
    // Always refresh in the background so posts added after the last build
    // still appear (stale-while-revalidate: prerendered data shows instantly).
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = useCallback(() => setSelected(null), []);
  const closeEvent = useCallback(() => setSelectedEvent(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        closeEvent();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, closeEvent]);

  const selectedTitle = selected
    ? localized(selected, locale, "title_en", "title_my")
    : "";
  const selectedBody = selected
    ? localized(selected, locale, "body_en", "body_my")
    : "";

  // Featured layout: the most recent post becomes the hero card; the rest
  // flow into the grid below it.
  const featured = news?.[0] ?? null;
  const restNews = news ? news.slice(1) : [];
  const gridNews = featured ? restNews : news ?? [];

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: t("tabAll"), count: (news?.length ?? 0) + (events?.length ?? 0) },
    { key: "news", label: t("tabNews"), count: news?.length ?? 0 },
    { key: "events", label: t("tabEvents"), count: events?.length ?? 0 },
  ];

  const newsHeading = (
    <h2 className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
      <span aria-hidden className="h-6 w-1.5 rounded-full bg-brand" />
      {t("newsTitle")}
    </h2>
  );

  const eventsHeading = (
    <h2 className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
      <span aria-hidden className="h-6 w-1.5 rounded-full bg-accent" />
      {t("eventsTitle")}
    </h2>
  );

  return (
    <>
      <PageHeader title={t("title")}>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200">
          {t("subtitle")}
        </p>
      </PageHeader>
      <div className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("title")}>
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              aria-pressed={tab === key}
              onClick={() => setTab(key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                tab === key
                  ? "bg-brand text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-brand/40 hover:text-brand"
              }`}
            >
              {label}
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  tab === key
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <ListSkeleton />
        ) : (
          <>
        {/* Featured hero card — newest post, shown on All and News tabs */}
        {(tab === "all" || tab === "news") && featured && (
          <article className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
            <div className="grid md:grid-cols-2">
              <div className="relative min-h-[240px] md:min-h-[300px]">
                {featured.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.image_url}
                    alt={localized(featured, locale, "title_en", "title_my")}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand to-brand-light text-7xl">
                    <span aria-hidden>🏫</span>
                  </div>
                )}
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand shadow">
                  {t("latestBadge")}
                </span>
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-dark">
                  {formatDate(featured.published_at, locale)}
                </p>
                <h2 className="mt-2 text-2xl font-bold leading-snug text-slate-900 sm:text-3xl">
                  {localized(featured, locale, "title_en", "title_my")}
                </h2>
                <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-slate-600">
                  {localized(featured, locale, "body_en", "body_my")}
                </p>
                <button
                  type="button"
                  onClick={() => setSelected(featured)}
                  className="mt-5 self-start rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark"
                >
                  {common("readMore")} →
                </button>
              </div>
            </div>
          </article>
        )}

        {/* All — remaining news beside the events sidebar. The layout
            adapts whenever one side has nothing to show, so no blank
            column remains (a lone post becomes the hero, a lone side
            stretches to fill). */}
        {tab === "all" && (
          <div
            className={`mt-10 grid gap-10 ${
              gridNews.length > 0 && events!.length > 0 ? "lg:grid-cols-5" : ""
            }`}
          >
            {(gridNews.length > 0 || news!.length === 0) && (
              <div
                className={
                  gridNews.length > 0
                    ? events!.length > 0
                      ? "lg:col-span-3"
                      : ""
                    : "mx-auto w-full max-w-3xl"
                }
              >
                {gridNews.length > 0 ? (
                  <>
                    {newsHeading}
                    <div
                      className={`mt-5 grid gap-5 sm:grid-cols-2 ${
                        events!.length > 0 ? "" : "xl:grid-cols-3"
                      }`}
                    >
                      {gridNews.map((item) => (
                        <NewsCard key={item.id} item={item} onRead={setSelected} />
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                    {t("noNews")}
                  </p>
                )}
              </div>
            )}
            {events!.length > 0 && (
              <div
                className={
                  gridNews.length > 0
                    ? "lg:col-span-2"
                    : "mx-auto w-full max-w-3xl"
                }
              >
                {eventsHeading}
                <div className="mt-5">
                  <EventsList
                    events={events!}
                    onDetails={(ev) => setSelectedEvent(ev)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* News only — wider grid across the full width */}
        {tab === "news" && (
          <div className="mt-10">
            {gridNews.length > 0 ? (
              <>
                {newsHeading}
                <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {gridNews.map((item) => (
                    <NewsCard key={item.id} item={item} onRead={setSelected} />
                  ))}
                </div>
              </>
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                {t("noNews")}
              </p>
            )}
          </div>
        )}

        {/* Events only — the list, centered for comfortable reading */}
        {tab === "events" && (
          <div className="mx-auto mt-10 max-w-3xl">
            {eventsHeading}
            <div className="mt-5">
              <EventsList
                events={events!}
                onDetails={(ev) => setSelectedEvent(ev)}
              />
            </div>
          </div>
        )}
          </>
        )}

        {/* Event details modal */}
        {selectedEvent && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm max-md:items-end max-md:p-0"
            onClick={closeEvent}
          >
            <div
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl max-md:max-w-full max-md:rounded-b-none max-md:rounded-t-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={localized(selectedEvent, locale, "title_en", "title_my")}
            >
              {selectedEvent.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedEvent.image_url}
                  alt={localized(selectedEvent, locale, "title_en", "title_my")}
                  className="max-h-72 w-full object-contain"
                />
              ) : (
                <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-brand to-brand-light text-6xl">
                  <span aria-hidden>📅</span>
                </div>
              )}
              <div className="p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-dark">
                  {formatDateShort(selectedEvent.date, locale)}
                  {selectedEvent.time ? ` · ${selectedEvent.time}` : ""}
                </p>
                <h2 className="mt-2 text-2xl font-bold leading-snug text-slate-900">
                  {localized(selectedEvent, locale, "title_en", "title_my")}
                </h2>
                {localized(selectedEvent, locale, "location_en", "location_my") && (
                  <p className="mt-2 text-sm text-slate-500">
                    📍 {localized(selectedEvent, locale, "location_en", "location_my")}
                  </p>
                )}
                <div className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-slate-700">
                  {localized(selectedEvent, locale, "description_en", "description_my")}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/register?event=${selectedEvent.id}`}
                    className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark"
                  >
                    {nav("register")}
                  </Link>
                  <button
                    type="button"
                    onClick={closeEvent}
                    className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    {common("close")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Article modal */}
        {selected && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm max-md:items-end max-md:p-0"
            onClick={close}
          >
            <div
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl max-md:max-w-full max-md:rounded-b-none max-md:rounded-t-2xl"
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
