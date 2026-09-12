"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fetchEvents, fetchNews } from "@/lib/db";
import type { EventItem, NewsItem } from "@/lib/types";
import EventsList from "./EventsList";
import NewsCard from "./NewsCard";

export default function NewsEventsHome({
  initialNews,
  initialEvents,
}: {
  /** Prerendered news (up to 3) — shown instantly, no "No news" flash. */
  initialNews?: NewsItem[];
  /** Prerendered events (up to 3) — shown instantly, no "No events" flash. */
  initialEvents?: EventItem[];
}) {
  const t = useTranslations("home");
  const newsT = useTranslations("news");
  const common = useTranslations("common");
  const locale = useLocale();
  // Null = still loading → skeleton instead of a premature "No news" flash.
  const [news, setNews] = useState<NewsItem[] | null>(initialNews ?? null);
  const [events, setEvents] = useState<EventItem[] | null>(initialEvents ?? null);

  useEffect(() => {
    // Always refresh in the background so posts added after the last build
    // still appear (stale-while-revalidate over the prerendered data).
    let active = true;
    Promise.all([fetchNews(), fetchEvents()]).then(([n, e]) => {
      if (!active) return;
      setNews(n.slice(0, 3));
      setEvents(e.slice(0, 3));
    });
    return () => {
      active = false;
    };
  }, []);

  if (news === null || events === null) {
    return (
      <section className="bg-cream" aria-hidden>
        <div className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-5">
            <div className="space-y-5 lg:col-span-3">
              <div className="h-8 w-2/3 animate-pulse rounded-lg bg-slate-200/70" />
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="h-44 animate-pulse rounded-2xl bg-slate-200/70" />
                <div className="h-44 animate-pulse rounded-2xl bg-slate-200/70" />
              </div>
            </div>
            <div className="space-y-3 lg:col-span-2">
              <div className="h-8 w-1/2 animate-pulse rounded-lg bg-slate-200/70" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200/70" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* News */}
          <div className="lg:col-span-3">
            {/* Row on tablet/desktop; stacked on phones so the "View all"
                link never collides with the heading. */}
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-widest text-brand">
                  {t("newsEyebrow")}
                </span>
                <h2 className="mt-1.5 text-2xl font-bold text-slate-900 sm:text-3xl">
                  {t("newsTitle")}
                </h2>
                <p className="mt-1 text-slate-500">{t("newsSubtitle")}</p>
              </div>
              <Link
                href="/news"
                className="shrink-0 self-end text-sm font-semibold text-brand hover:underline"
              >
                {common("viewAll")} →
              </Link>
            </div>
            {news.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                {newsT("noNews")}
              </p>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {news.map((item) => (
                  <NewsCard
                    key={item.id}
                    item={item}
                    onRead={() =>
                      window.open(`/${locale}/news/?post=${item.id}`, "_self")
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Events */}
          <div className="lg:col-span-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand">
                {t("eventsEyebrow")}
              </span>
              <h2 className="mt-1.5 text-2xl font-bold text-slate-900 sm:text-3xl">
                {t("eventsTitle")}
              </h2>
              <p className="mt-1 text-slate-500">{t("eventsSubtitle")}</p>
            </div>
            <div className="mt-6">
              <EventsList events={events} loading={events === null} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}