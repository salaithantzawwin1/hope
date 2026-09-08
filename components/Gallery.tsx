"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { fetchGallery } from "@/lib/db";
import { FALLBACK_GALLERY } from "@/lib/fallback-data";
import { localized, type GalleryImage } from "@/lib/types";

interface GalleryTile {
  id: string;
  imageUrl: string | null;
  caption: string;
}

const PLACEHOLDER_EMOJI = ["🎨", "🔬", "⚽", "📚", "🎭", "🏛️"];

export default function Gallery({ title }: { title?: string }) {
  const locale = useLocale();
  const [items, setItems] = useState<GalleryTile[]>([]);

  useEffect(() => {
    let active = true;
    fetchGallery().then((rows: GalleryImage[]) => {
      if (!active) return;
      if (rows.length > 0) {
        setItems(
          rows.map((row) => ({
            id: row.id,
            imageUrl: row.image_url,
            caption: localized(row, locale, "caption_en", "caption_my"),
          })),
        );
      } else {
        setItems(
          FALLBACK_GALLERY.map((g, i) => ({
            id: `fallback-${i}`,
            imageUrl: null,
            caption: locale === "my" ? g.caption_my : g.caption_en,
          })),
        );
      }
    });
    return () => {
      active = false;
    };
  }, [locale]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      {title && (
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {title}
        </h2>
      )}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {items.map((item, i) => (
          <figure
            key={item.id}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
          >
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.caption}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${
                  i % 2 === 0
                    ? "from-brand to-brand-light"
                    : "from-accent to-accent-dark"
                } text-6xl`}
              >
                <span aria-hidden>{PLACEHOLDER_EMOJI[i % PLACEHOLDER_EMOJI.length]}</span>
              </div>
            )}
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent px-3 pb-2.5 pt-8 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              {item.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}