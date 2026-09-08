"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { fetchSiteContent } from "@/lib/db";

let cache: Record<string, { en: string; my: string }> | null = null;
let cachePromise: Promise<Record<string, { en: string; my: string }>> | null = null;

function loadContent() {
  if (cache) return Promise.resolve(cache);
  if (!cachePromise) {
    cachePromise = fetchSiteContent().then((value) => {
      cache = value;
      return value;
    });
  }
  return cachePromise;
}

/**
 * Renders editable text stored in the `site_content` table (via the admin
 * portal). Until Supabase is configured — or for keys without a value — the
 * `en`/`my` props passed from the message catalogs are shown.
 */
export default function SiteText({
  k,
  en,
  my,
  as: Tag = "span",
  className,
}: {
  k: string;
  en: string;
  my: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
}) {
  const locale = useLocale();
  const [dbValue, setDbValue] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadContent().then((map) => {
      if (!active) return;
      const row = map[k];
      const value = row ? row[locale === "my" ? "my" : "en"] : "";
      setDbValue(value?.trim() ? value : null);
    });
    return () => {
      active = false;
    };
  }, [k, locale]);

  const fallback = locale === "my" ? my : en;
  return <Tag className={className}>{dbValue ?? fallback}</Tag>;
}