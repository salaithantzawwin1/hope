import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import NewsEventsPage from "@/components/NewsEventsPage";
import { fetchEvents, fetchNews } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  return { title: t("title") };
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Fetched at build time so the exported HTML already contains the posts —
  // visitors see content instantly; the client refetches for freshness.
  const [news, events] = await Promise.all([fetchNews(), fetchEvents()]);
  return <NewsEventsPage initialNews={news} initialEvents={events} />;
}