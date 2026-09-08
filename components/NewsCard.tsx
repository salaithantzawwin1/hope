"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@/lib/format";
import { localized, type NewsItem } from "@/lib/types";

export default function NewsCard({
  item,
  onRead,
}: {
  item: NewsItem;
  onRead: (item: NewsItem) => void;
}) {
  const t = useTranslations("common");
  const locale = useLocale();
  const title = localized(item, locale, "title_en", "title_my");
  const body = localized(item, locale, "body_en", "body_my");

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt={title}
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-brand to-brand-light text-6xl">
          <span aria-hidden>🏫</span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-dark">
          {formatDate(item.published_at, locale)}
        </p>
        <h3 className="mt-2 text-lg font-bold leading-snug text-slate-900">
          {title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
          {body}
        </p>
        <button
          type="button"
          onClick={() => onRead(item)}
          className="mt-4 self-start text-sm font-semibold text-brand transition-colors hover:text-brand-dark hover:underline"
        >
          {t("readMore")} →
        </button>
      </div>
    </article>
  );
}