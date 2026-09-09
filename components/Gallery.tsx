"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { fetchGallery } from "@/lib/db";
import { FALLBACK_GALLERY } from "@/lib/fallback-data";
import { localized, type GalleryImage } from "@/lib/types";

interface GalleryTile {
  id: string;
  imageUrl: string | null;
  caption: string;
}

interface AlbumGroup {
  /** Stable key: album_en\0album_my (used for the URL hash). */
  key: string;
  titleEn: string;
  titleMy: string;
  descEn: string;
  descMy: string;
  newestAt: string;
  items: GalleryTile[];
}

const PLACEHOLDER_EMOJI = ["🎨", "🔬", "⚽", "📚", "🎭", "🏛️"];

/** One square photo tile; clicking opens the lightbox (only for real images). */
function Tile({ item, index, onOpen }: { item: GalleryTile; index: number; onOpen: (i: number) => void }) {
  return (
    <figure className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {item.imageUrl ? (
        <button
          type="button"
          onClick={() => onOpen(index)}
          className="h-full w-full cursor-zoom-in"
          aria-label={item.caption || "Photo"}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.caption}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </button>
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${
            index % 2 === 0 ? "from-brand to-brand-light" : "from-accent to-accent-dark"
          } text-6xl`}
        >
          <span aria-hidden>{PLACEHOLDER_EMOJI[index % PLACEHOLDER_EMOJI.length]}</span>
        </div>
      )}
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent px-3 pb-2.5 pt-8 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
        {item.caption}
      </figcaption>
    </figure>
  );
}

/**
 * Facebook-style photo albums: the page starts on a grid of album cover
 * cards (cover photo + title + photo count), each album opens its own photo
 * grid, and clicking a photo opens a full-screen lightbox with prev/next and
 * keyboard navigation. The active album is reflected in the URL hash
 * (#album=…), so album pages can be shared and the browser back button
 * works. Photos without an album group into a "Photos" album; when no named
 * albums exist the plain photo grid is shown directly.
 */
export default function Gallery() {
  const t = useTranslations("gallery");
  const common = useTranslations("common");
  const locale = useLocale();
  const [albums, setAlbums] = useState<AlbumGroup[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Lightbox zoom / pan / swipe state.
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [swipeX, setSwipeX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const touchRef = useRef<{
    mode: "none" | "swipe" | "pan" | "pinch";
    startX: number;
    startY: number;
    startPinch: number;
    startZoom: number;
    startOffset: { x: number; y: number };
  }>({ mode: "none", startX: 0, startY: 0, startPinch: 0, startZoom: 1, startOffset: { x: 0, y: 0 } });

  const clampZoom = (z: number) => Math.min(5, Math.max(1, z));
  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSwipeX(0);
  };

  // Reset the zoom/pan view whenever the lightbox opens or moves to another
  // photo. Deferred out of the synchronous effect body (cascading-render rule).
  useEffect(() => {
    const id = requestAnimationFrame(resetView);
    return () => cancelAnimationFrame(id);
  }, [lightbox]);

  /** Keep the panned image inside the visible area at the current zoom. */
  const clampOffset = (o: { x: number; y: number }) => {
    const el = wrapRef.current;
    if (!el) return o;
    const maxX = ((el.clientWidth * (zoom - 1)) / 2) * 0.9 + 4;
    const maxY = ((el.clientHeight * (zoom - 1)) / 2) * 0.9 + 4;
    return { x: Math.min(maxX, Math.max(-maxX, o.x)), y: Math.min(maxY, Math.max(-maxY, o.y)) };
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length >= 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      touchRef.current = { mode: "pinch", startX: 0, startY: 0, startPinch: d, startZoom: zoom, startOffset: offset };
    } else if (zoom > 1) {
      touchRef.current = { mode: "pan", startX: e.touches[0].clientX, startY: e.touches[0].clientY, startPinch: 0, startZoom: zoom, startOffset: offset };
      setDragging(true);
    } else {
      touchRef.current = { mode: "swipe", startX: e.touches[0].clientX, startY: e.touches[0].clientY, startPinch: 0, startZoom: 1, startOffset: { x: 0, y: 0 } };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const t = touchRef.current;
    if (t.mode === "pinch" && e.touches.length >= 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const next = clampZoom(t.startZoom * (d / Math.max(1, t.startPinch)));
      setZoom(next);
      setOffset(
        clampOffset({
          x: t.startOffset.x * (next / Math.max(1, t.startZoom)),
          y: t.startOffset.y * (next / Math.max(1, t.startZoom)),
        }),
      );
    } else if (t.mode === "pan" && e.touches.length === 1) {
      setOffset(
        clampOffset({
          x: t.startOffset.x + (e.touches[0].clientX - t.startX),
          y: t.startOffset.y + (e.touches[0].clientY - t.startY),
        }),
      );
    } else if (t.mode === "swipe" && e.touches.length === 1) {
      const dx = e.touches[0].clientX - t.startX;
      const dy = e.touches[0].clientY - t.startY;
      // Only swipe horizontally so vertical scrolling of the page still works.
      if (Math.abs(dx) > Math.abs(dy)) {
        setSwipeX(dx);
        setDragging(true);
      }
    }
  };

  const onTouchEnd = () => {
    const t = touchRef.current;
    if (t.mode === "swipe") {
      const dx = swipeX;
      const len = currentItems.length;
      if (Math.abs(dx) > 60) {
        setLightbox((i) =>
          i === null ? null : dx < 0 ? (i + 1) % len : (i - 1 + len) % len,
        );
      }
      setSwipeX(0);
    }
    touchRef.current = { mode: "none", startX: 0, startY: 0, startPinch: 0, startZoom: 1, startOffset: { x: 0, y: 0 } };
    setDragging(false);
  };

  const onWheel = (e: React.WheelEvent) => {
    const next = clampZoom(zoom + (e.deltaY < 0 ? 0.15 : -0.15));
    if (next !== zoom) {
      setZoom(next);
      setOffset((o) => clampOffset(o));
    }
  };

  // Load + group photos by album (newest album first).
  useEffect(() => {
    let active = true;
    fetchGallery().then((rows: GalleryImage[]) => {
      if (!active) return;
      if (rows.length === 0) {
        setAlbums([
          {
            key: "fallback",
            titleEn: "",
            titleMy: "",
            descEn: "",
            descMy: "",
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
        const titleEn = row.album_en ?? "";
        const titleMy = row.album_my ?? "";
        const key = `${titleEn}\u0000${titleMy}`;
        let group = groups.get(key);
        if (!group) {
          group = {
            key,
            titleEn,
            titleMy,
            descEn: row.album_desc_en ?? "",
            descMy: row.album_desc_my ?? "",
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

  // Sync the active album with the URL hash (#album=…) so album pages can
  // be shared and the browser back/forward buttons work.
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      setActiveKey(hash.startsWith("album=") ? decodeURIComponent(hash.slice(6)) : null);
      setLightbox(null);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
    };
  }, []);

  const openAlbum = (key: string) => {
    setLightbox(null);
    history.pushState(null, "", `#album=${encodeURIComponent(key)}`);
    setActiveKey(key);
  };

  const closeAlbum = () => {
    setLightbox(null);
    // Clear the hash without leaving extra history entries.
    history.replaceState(null, "", window.location.pathname + window.location.search);
    setActiveKey(null);
  };

  const hasTitledAlbums = albums.some((a) => a.titleEn.trim() || a.titleMy.trim());
  const activeAlbum = activeKey ? albums.find((a) => a.key === activeKey) ?? null : null;
  // The tile list the lightbox navigates: the active album, or everything.
  const currentItems = hasTitledAlbums && activeAlbum ? activeAlbum.items : albums.flatMap((a) => a.items);

  // Keyboard navigation + body scroll lock while the lightbox is open.
  useEffect(() => {
    if (lightbox === null) return;
    const len = currentItems.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      else if (e.key === "ArrowLeft")
        setLightbox((i) => (i === null ? null : (i - 1 + len) % len));
      else if (e.key === "ArrowRight")
        setLightbox((i) => (i === null ? null : (i + 1) % len));
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, currentItems.length]);

  if (albums.length === 0) return null;

  const albumTitle = (a: AlbumGroup) =>
    a.titleEn.trim() || a.titleMy.trim()
      ? locale === "my" && a.titleMy.trim()
        ? a.titleMy
        : a.titleEn
      : t("photos");

  const albumDesc = (a: AlbumGroup) =>
    locale === "my" && a.descMy.trim()
      ? a.descMy
      : locale === "en" && a.descEn.trim()
        ? a.descEn
        : a.descMy.trim()
          ? a.descMy
          : a.descEn;

  let body;
  if (!hasTitledAlbums) {
    // No named albums — show the plain photo grid.
    body = (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {currentItems.map((item, i) => (
          <Tile key={item.id} item={item} index={i} onOpen={setLightbox} />
        ))}
      </div>
    );
  } else if (activeAlbum) {
    // Album detail: back link + title + photo grid.
    body = (
      <div>
        <button
          type="button"
          onClick={closeAlbum}
          className="text-sm font-semibold text-brand transition-colors hover:text-brand-dark hover:underline"
        >
          ← {t("backToAlbums")}
        </button>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            {albumTitle(activeAlbum)}
          </h2>
          <p className="text-sm text-slate-500">
            {t("photoCount", { count: activeAlbum.items.length })}
          </p>
        </div>
        {albumDesc(activeAlbum) && (
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {albumDesc(activeAlbum)}
          </p>
        )}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {activeAlbum.items.map((item, i) => (
            <Tile key={item.id} item={item} index={i} onOpen={setLightbox} />
          ))}
        </div>
      </div>
    );
  } else {
    // Album cover cards.
    body = (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {albums.map((album) => {
          const cover = album.items.find((i) => i.imageUrl)?.imageUrl ?? null;
          return (
            <button
              key={album.key}
              type="button"
              onClick={() => openAlbum(album.key)}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cover}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-light text-6xl">
                    <span aria-hidden>📷</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900">{albumTitle(album)}</h3>
                {albumDesc(album) && (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                    {albumDesc(album)}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  {t("photoCount", { count: album.items.length })}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  const active = lightbox !== null ? currentItems[lightbox] : null;

  return (
    <>
      {body}

      {active && (
        <div
          className="fixed inset-0 z-[70] flex flex-col bg-slate-950/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={active.caption || undefined}
          onClick={() => setLightbox(null)}
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3 text-white">
            <span className="text-sm text-slate-300">
              {(lightbox ?? 0) + 1} / {currentItems.length}
            </span>
            <div
              className="flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setZoom((z) => clampZoom(z - 0.5))}
                aria-label={t("zoomOut")}
                disabled={zoom <= 1}
                className="rounded-lg bg-white/10 px-2.5 py-1.5 text-sm font-bold transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                −
              </button>
              <button
                type="button"
                onClick={resetView}
                aria-label={t("zoomReset")}
                className="min-w-14 rounded-lg bg-white/10 px-2 py-1.5 text-center text-xs font-semibold tabular-nums transition-colors hover:bg-white/20"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => clampZoom(z + 0.5))}
                aria-label={t("zoomIn")}
                disabled={zoom >= 5}
                className="rounded-lg bg-white/10 px-2.5 py-1.5 text-sm font-bold transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                aria-label={common("close")}
                className="ml-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-white/20"
              >
                ✕ {common("close")}
              </button>
            </div>
          </div>
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center gap-2 px-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label={t("prev")}
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((i) => (i === null ? null : (i - 1 + currentItems.length) % currentItems.length));
              }}
              className="shrink-0 rounded-full bg-white/10 px-3 py-2 text-2xl font-bold text-white transition-colors hover:bg-white/25"
            >
              ‹
            </button>
            <figure className="flex min-w-0 max-h-full flex-col items-center">
              <div
                ref={wrapRef}
                className={`relative max-h-[70vh] max-w-full overflow-hidden rounded-lg shadow-2xl ${
                  zoom > 1 ? "cursor-grab touch-none select-none active:cursor-grabbing" : "touch-pan-y"
                }`}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onWheel={onWheel}
                onDoubleClick={() => (zoom > 1 ? resetView() : setZoom(2.5))}
                title={zoom > 1 ? "Scroll or pinch to zoom · drag to pan" : undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={active.imageUrl ?? ""}
                  alt={active.caption}
                  draggable={false}
                  style={{
                    transform: `translate3d(${offset.x + swipeX}px, ${offset.y}px, 0) scale(${zoom})`,
                    transition: dragging ? "none" : "transform 200ms ease-out",
                  }}
                  className="max-h-[70vh] max-w-full rounded-lg object-contain"
                />
              </div>
              {active.caption && (
                <figcaption className="mt-3 max-w-xl text-center text-sm text-slate-200">
                  {active.caption}
                </figcaption>
              )}
            </figure>
            <button
              type="button"
              aria-label={t("next")}
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((i) => (i === null ? null : (i + 1) % currentItems.length));
              }}
              className="shrink-0 rounded-full bg-white/10 px-3 py-2 text-2xl font-bold text-white transition-colors hover:bg-white/25"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </>
  );
}