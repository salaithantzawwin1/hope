"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { fetchEvents, fetchNews } from "@/lib/db";
import { formatDate, formatDateShort } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { localized, type EventItem, type NewsItem } from "@/lib/types";
import EventsList from "./EventsList";
import NewsCard from "./NewsCard";
import PageHeader from "./PageHeader";

/** Brand gradient + monogram shown when a cover image is missing or fails. */
function CoverFallback({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-brand via-brand to-brand-light ${className}`}
      aria-hidden
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black text-white/90 backdrop-blur-sm">
        {label.slice(0, 1).toUpperCase()}
      </span>
    </div>
  );
}

type Tab = "all" | "news" | "events";

/**
 * Cover image that falls back to the brand block when the file is missing
 * (deleted from R2) or fails to load — including the prerendered-HTML case:
 * a static <img> may already have failed before React attaches onError, so
 * after mount we check complete/naturalWidth and flip to the fallback.
 */
function SafeCover({
  src,
  label,
  className = "",
  imgClassName = "",
}: {
  src: string;
  label: string;
  className?: string;
  imgClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) return <CoverFallback label={label} className={className} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={label}
      loading="lazy"
      className={imgClassName}
      onError={() => setFailed(true)}
    />
  );
}

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
    <h2 className="flex items-center gap-2.5 text-lg font-bold uppercase tracking-wide text-slate-900">
      <span aria-hidden className="h-5 w-1 rounded-full bg-brand" />
      {t("newsTitle")}
    </h2>
  );

  const eventsHeading = (
    <h2 className="flex items-center gap-2.5 text-lg font-bold uppercase tracking-wide text-slate-900">
      <span aria-hidden className="h-5 w-1 rounded-full bg-accent" />
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
      <div className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 pb-16 sm:px-6">
        {/* Filter tabs */}
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("title")}>
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              aria-pressed={tab === key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                tab === key
                  ? "bg-brand text-white shadow-md shadow-brand/25"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-brand/40 hover:text-brand"
              }`}
            >
              {label}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
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
          <article className="group mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5 transition-shadow hover:shadow-xl">
            <div className="grid md:grid-cols-5">
              <div className="relative min-h-[220px] bg-slate-100 md:col-span-3 md:min-h-[300px]">
                <SafeCover
                  src={featured.image_url as string}
                  label={localized(featured, locale, "title_en", "title_my")}
                  className="absolute inset-0 h-full w-full"
                  imgClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {t("latestBadge")}
                </span>
              </div>
              <div className="flex flex-col justify-center border-t border-slate-100 p-6 sm:p-8 md:col-span-2 md:border-l md:border-t-0">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-dark">
                  <span aria-hidden className="h-px w-6 bg-accent-dark/60" />
                  {formatDate(featured.published_at, locale)}
                </p>
                <h2 className="mt-3 text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
                  {localized(featured, locale, "title_en", "title_my")}
                </h2>
                <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-slate-600">
                  {localized(featured, locale, "body_en", "body_my")}
                </p>
                <button
                  type="button"
                  onClick={() => setSelected(featured)}
                  className="mt-6 inline-flex items-center gap-2 self-start rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-dark hover:shadow-md"
                >
                  {common("readMore")}
                  <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
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
                <SafeCover
                  src={selectedEvent.image_url}
                  label={localized(selectedEvent, locale, "title_en", "title_my")}
                  className="h-36 w-full"
                  imgClassName="max-h-72 w-full bg-slate-100 object-contain"
                />
              ) : (
                <CoverFallback
                  label={localized(selectedEvent, locale, "title_en", "title_my")}
                  className="h-36 w-full"
                />
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
                <SafeCover
                  src={selected.image_url}
                  label={selectedTitle}
                  className="h-40 w-full"
                  imgClassName="h-60 w-full bg-slate-100 object-cover"
                />
              ) : (
                <CoverFallback label={selectedTitle} className="h-40 w-full" />
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
