"use client";

import { useEffect, useRef, useState } from "react";
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
  // A broken cover (deleted from R2, etc.) falls back to the monogram block
  // instead of leaving a torn image icon inside the card. The complete/natural
  // check after mount catches images that already failed in the prerendered
  // HTML, before React could attach an onError listener.
  const [coverFailed, setCoverFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setCoverFailed(true);
  }, []);
  const showImage = Boolean(item.image_url) && !coverFailed;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <button
        type="button"
        onClick={() => onRead(item)}
        className="relative block h-44 w-full overflow-hidden bg-slate-100 text-left"
        aria-label={title}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={item.image_url as string}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            onError={() => setCoverFailed(true)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand via-brand to-brand-light">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-xl font-black text-white/90 backdrop-blur-sm">
              {title.slice(0, 1).toUpperCase()}
            </span>
          </span>
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900/25 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        />
      </button>
      <div className="flex flex-1 flex-col p-5">
        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-accent-dark">
          <span aria-hidden className="h-px w-5 bg-accent-dark/50" />
          {formatDate(item.published_at, locale)}
        </p>
        <h3 className="mt-2 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand">
          {title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
          {body}
        </p>
        <button
          type="button"
          onClick={() => onRead(item)}
          className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          {t("readMore")}
          <span
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </button>
      </div>
    </article>
  );
}
