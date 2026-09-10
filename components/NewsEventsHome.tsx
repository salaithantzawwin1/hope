"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fetchEvents, fetchNews } from "@/lib/db";
import type { EventItem, NewsItem } from "@/lib/types";
import EventsList from "./EventsList";
import NewsCard from "./NewsCard";

export default function NewsEventsHome() {
  const t = useTranslations("home");
  const newsT = useTranslations("news");
  const common = useTranslations("common");
  const locale = useLocale();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
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

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* News */}
          <div className="lg:col-span-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  {t("newsTitle")}
                </h2>
                <p className="mt-1 text-slate-500">{t("newsSubtitle")}</p>
              </div>
              <Link
                href="/news"
                className="shrink-0 text-sm font-semibold text-brand hover:underline"
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
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  {t("eventsTitle")}
                </h2>
                <p className="mt-1 text-slate-500">{t("eventsSubtitle")}</p>
              </div>
            </div>
            <div className="mt-6">
              <EventsList events={events} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}