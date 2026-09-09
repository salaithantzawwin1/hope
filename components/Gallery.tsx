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

interface AlbumGroup {
  titleEn: string;
  titleMy: string;
  newestAt: string;
  items: GalleryTile[];
}

const PLACEHOLDER_EMOJI = ["🎨", "🔬", "⚽", "📚", "🎭", "🏛️"];

/**
 * Photo gallery grouped into albums. Each photo can carry an album name
 * (English + Burmese, set from the admin portal); photos are grouped by
 * album and each album renders as its own section with a title. Photos
 * without an album render without a heading. When the database is empty the
 * sample tiles are shown instead.
 */
export default function Gallery({ title }: { title?: string }) {
  const locale = useLocale();
  const [albums, setAlbums] = useState<AlbumGroup[]>([]);

  useEffect(() => {
    let active = true;
    fetchGallery().then((rows: GalleryImage[]) => {
      if (!active) return;
      if (rows.length === 0) {
        setAlbums([
          {
            titleEn: "",
            titleMy: "",
            newestAt: "",
            items: FALLBACK_GALLERY.map((g, i) => ({
              id: `fallback-${i}`,
              imageUrl: null,
              caption: locale === "my" ? g.caption_my : g.caption_en,
            })),
          },
        ]);
        return;
      }
      const groups = new Map<string, AlbumGroup>();
      for (const row of rows) {
        const key = `${row.album_en ?? ""}\u0000${row.album_my ?? ""}`;
        let group = groups.get(key);
        if (!group) {
          group = {
            titleEn: row.album_en ?? "",
            titleMy: row.album_my ?? "",
            newestAt: row.created_at,
            items: [],
          };
          groups.set(key, group);
        }
        group.items.push({
          id: row.id,
          imageUrl: row.image_url,
          caption: localized(row, locale, "caption_en", "caption_my"),
        });
        if (row.created_at > group.newestAt) group.newestAt = row.created_at;
      }
      // Newest album first; photos inside an album stay newest-first too.
      setAlbums(
        Array.from(groups.values()).sort((a, b) =>
          b.newestAt.localeCompare(a.newestAt),
        ),
      );
    });
    return () => {
      active = false;
    };
  }, [locale]);

  return (
    // Renders just the album sections (no page section wrapper): the About
    // page already provides the container, heading and padding.
    <div>
      {title && (
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {title}
        </h2>
      )}
      <div className={`space-y-12 ${title ? "mt-8" : "mt-6"}`}>
        {albums.map((album, ai) => {
          const albumTitle =
            locale === "my" && album.titleMy.trim()
              ? album.titleMy
              : album.titleEn;
          return (
            <div key={ai}>
              {albumTitle && (
                <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                  {albumTitle}
                </h3>
              )}
              <div
                className={`grid grid-cols-2 gap-4 md:grid-cols-3 ${
                  albumTitle ? "mt-4" : ""
                }`}
              >
                {album.items.map((item, i) => (
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
                        <span aria-hidden>
                          {PLACEHOLDER_EMOJI[i % PLACEHOLDER_EMOJI.length]}
                        </span>
                      </div>
                    )}
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent px-3 pb-2.5 pt-8 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {item.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}