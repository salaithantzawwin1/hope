"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";
import type { GalleryImage } from "@/lib/types";
import { Button, Card, Field, Notice, Select, SubTabs, TextInput } from "./ui";

/** Writable album fields for the album-level editor. */
interface AlbumEdit {
  titleEn: string;
  titleMy: string;
  descEn: string;
  descMy: string;
}

/** Small input style for the per-photo edit fields. */
const inputSm =
  "w-full min-w-0 rounded border border-slate-300 px-2 py-1 text-xs focus:border-brand focus:outline-none";

/** Local thumbnail of a chosen file, so staff review photos before upload. */
function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let current: string | null = null;
    // Creating the object URL inside requestAnimationFrame keeps the state
    // update out of the synchronous effect body (cascading-render rule).
    const id = requestAnimationFrame(() => {
      current = URL.createObjectURL(file);
      setUrl(current);
    });
    return () => {
      cancelAnimationFrame(id);
      if (current) URL.revokeObjectURL(current);
    };
  }, [file]);
  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="aspect-square w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        title="Remove from selection"
        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white hover:bg-black/85"
      >
        ✕
      </button>
    </div>
  );
}

type GallerySection = "upload" | "albums" | "photos";

const GALLERY_SECTIONS: { id: GallerySection; label: string }[] = [
  { id: "upload", label: "Upload Photos" },
  { id: "albums", label: "Edit Albums" },
  { id: "photos", label: "Manage Photos" },
];

export default function AdminGallery() {
  const [section, setSection] = useState<GallerySection>("upload");
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [captionEn, setCaptionEn] = useState("");
  const [captionMy, setCaptionMy] = useState("");
  const [albumEn, setAlbumEn] = useState("");
  const [albumMy, setAlbumMy] = useState("");
  const [albumDescEn, setAlbumDescEn] = useState("");
  const [albumDescMy, setAlbumDescMy] = useState("");
  const [albumEdits, setAlbumEdits] = useState<Record<string, AlbumEdit>>({});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);

  // Batch selection + mass operations
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchAlbumEn, setBatchAlbumEn] = useState("");
  const [batchAlbumMy, setBatchAlbumMy] = useState("");

  // Filter / search
  const [filterAlbum, setFilterAlbum] = useState("");
  const [search, setSearch] = useState("");

  const supabase = getSupabase();

  const load = async (): Promise<GalleryImage[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as GalleryImage[];
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const items = await load();
      if (active) setItems(items);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upload = async () => {
    if (!supabase) return;
    if (files.length === 0) {
      setError("Choose at least one image first.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const image_url = await uploadImage(file, "gallery");
        const { error } = await supabase.from("gallery").insert({
          image_url,
          caption_en: captionEn.trim() || null,
          caption_my: captionMy.trim() || null,
          album_en: albumEn.trim() || null,
          album_my: albumMy.trim() || null,
          album_desc_en: albumDescEn.trim() || null,
          album_desc_my: albumDescMy.trim() || null,
        });
        if (error) throw error;
      }
      setFiles([]);
      setCaptionEn("");
      setCaptionMy("");
      setAlbumEn("");
      setAlbumMy("");
      setAlbumDescEn("");
      setAlbumDescMy("");
      setItems(await load());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const savePhoto = async (item: GalleryImage) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("gallery")
      .update({
        caption_en: item.caption_en?.trim() || null,
        caption_my: item.caption_my?.trim() || null,
        album_en: item.album_en?.trim() || null,
        album_my: item.album_my?.trim() || null,
      })
      .eq("id", item.id);
    if (error) {
      setError(error.message);
    } else {
      setError("");
      setSavedId(item.id);
      setItems(await load());
    }
  };

  const remove = async (item: GalleryImage) => {
    if (!supabase) return;
    if (!window.confirm("Delete this photo?")) return;
    const { error } = await supabase.from("gallery").delete().eq("id", item.id);
    if (!error) setItems(await load());
  };

  const toggleSelected = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const moveSelected = async () => {
    if (!supabase || selected.size === 0) return;
    const { error } = await supabase
      .from("gallery")
      .update({
        album_en: batchAlbumEn.trim() || null,
        album_my: batchAlbumMy.trim() || null,
      })
      .in("id", Array.from(selected));
    if (error) {
      setError(error.message);
    } else {
      setError("");
      setSelected(new Set());
      setBatchAlbumEn("");
      setBatchAlbumMy("");
      setItems(await load());
    }
  };

  const deleteSelected = async () => {
    if (!supabase || selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} selected photo(s)?`)) return;
    const { error } = await supabase
      .from("gallery")
      .delete()
      .in("id", Array.from(selected));
    if (!error) {
      setSelected(new Set());
      setItems(await load());
    }
  };

  /** Removes an album entirely; optionally deletes its photos too. */
  const deleteAlbum = async (key: string) => {
    if (!supabase) return;
    const ids = items
      .filter((i) => `${i.album_en ?? ""}\u0000${i.album_my ?? ""}` === key)
      .map((i) => i.id);
    const name = key.split("\u0000").filter(Boolean).join(" / ") || "this album";
    if (!window.confirm(`Delete album "${name}"?`)) return;
    if (window.confirm("Also delete the photos themselves? OK = delete photos, Cancel = keep them as uncategorized")) {
      const { error } = await supabase.from("gallery").delete().in("id", ids);
      if (error) setError(error.message);
    } else {
      const { error } = await supabase
        .from("gallery")
        .update({ album_en: null, album_my: null, album_desc_en: null, album_desc_my: null })
        .in("id", ids);
      if (error) setError(error.message);
    }
    setSelected(new Set());
    setItems(await load());
  };

  // Group the loaded photos into titled albums for the album-level editor.
  const albumGroups = Array.from(
    new Map(
      items
        .filter((i) => i.album_en?.trim() || i.album_my?.trim())
        .map((i) => {
          const key = `${i.album_en ?? ""}\u0000${i.album_my ?? ""}`;
          return [key, { key, count: 0, item: i }] as const;
        }),
    ).values(),
  ).map((g) => ({ ...g, count: items.filter((i) => `${i.album_en ?? ""}\u0000${i.album_my ?? ""}` === g.key).length }));

  /** Current edit value for an album (draft if present, otherwise first photo). */
  const albumValue = (key: string, item: GalleryImage): AlbumEdit =>
    albumEdits[key] ?? {
      titleEn: item.album_en ?? "",
      titleMy: item.album_my ?? "",
      descEn: item.album_desc_en ?? "",
      descMy: item.album_desc_my ?? "",
    };

  const setAlbumValue = (key: string, field: keyof AlbumEdit, value: string) =>
    setAlbumEdits((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? { titleEn: "", titleMy: "", descEn: "", descMy: "" }), [field]: value },
    }));

  const saveAlbum = async (key: string) => {
    if (!supabase) return;
    const edit = albumEdits[key];
    if (!edit) return;
    const ids = items
      .filter((i) => `${i.album_en ?? ""}\u0000${i.album_my ?? ""}` === key)
      .map((i) => i.id);
    const { error } = await supabase
      .from("gallery")
      .update({
        album_en: edit.titleEn.trim() || null,
        album_my: edit.titleMy.trim() || null,
        album_desc_en: edit.descEn.trim() || null,
        album_desc_my: edit.descMy.trim() || null,
      })
      .in("id", ids);
    if (error) {
      setError(error.message);
    } else {
      setError("");
      setItems(await load());
      // Clear the draft so the editor shows the saved values.
      setAlbumEdits((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // Unique albums for the filter dropdown (from the loaded photos).
  const albumOptions = Array.from(
    new Map(
      items
        .map((i) => ({
          key: `${i.album_en ?? ""}\u0000${i.album_my ?? ""}`,
          label:
            [i.album_en, i.album_my].filter((v) => v && v.trim()).join(" / ") ||
            "Uncategorized",
        }))
        .filter((o) => o.key !== "\u0000")
        .map((o) => [o.key, o.label] as const),
    ).values(),
  );

  const filtered = items.filter((item) => {
    const albumKey = `${item.album_en ?? ""}\u0000${item.album_my ?? ""}`;
    if (filterAlbum && albumKey !== filterAlbum) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const haystack = [item.caption_en, item.caption_my, item.album_en, item.album_my]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((i) => selected.has(i.id));
  const toggleSelectAll = () =>
    setSelected(allFilteredSelected ? new Set() : new Set(filtered.map((i) => i.id)));

  if (!supabase) return null;

  return (
    <div className="space-y-6">
      {error && <Notice kind="error">{error}</Notice>}

      <SubTabs
        tabs={GALLERY_SECTIONS}
        active={section}
        onChange={(id) => setSection(id as GallerySection)}
      />

      {section === "upload" && (
      <Card className="space-y-4 p-5">
        <h3 className="font-bold text-slate-900">Upload Photos</h3>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700"
        />
        {files.length > 0 && (
          <div>
            <p className="text-xs text-slate-500">
              {files.length} image(s) selected — previewed below, only uploaded
              when you click Upload (auto-resized to 1600px JPEG).
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {files.map((file, i) => (
                <FilePreview
                  key={`${file.name}-${i}`}
                  file={file}
                  onRemove={() => setFiles(files.filter((_, j) => j !== i))}
                />
              ))}
            </div>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Caption (English)">
            <TextInput
              value={captionEn}
              onChange={(e) => setCaptionEn(e.target.value)}
              placeholder="e.g. Our classroom"
            />
          </Field>
          <Field label="Caption (မြန်မာ)">
            <TextInput
              value={captionMy}
              onChange={(e) => setCaptionMy(e.target.value)}
              placeholder="ဥပမာ — ကျွန်ုပ်တို့၏ စာသင်ခန်း"
            />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Album (English)" hint="Leave empty for uncategorized.">
            <TextInput
              value={albumEn}
              onChange={(e) => setAlbumEn(e.target.value)}
              placeholder="e.g. Sports Day"
            />
          </Field>
          <Field label="Album (မြန်မာ)" hint="ဗလာထားရင် အမျိုးအစားမသတ်မှတ်ပါ။">
            <TextInput
              value={albumMy}
              onChange={(e) => setAlbumMy(e.target.value)}
              placeholder="ဥပမာ — အားကစားနေ့"
            />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Album description (English)" hint="Shown on the album cover card.">
            <TextInput
              value={albumDescEn}
              onChange={(e) => setAlbumDescEn(e.target.value)}
              placeholder="e.g. Highlights from our annual sports festival"
            />
          </Field>
          <Field label="Album description (မြန်မာ)">
            <TextInput
              value={albumDescMy}
              onChange={(e) => setAlbumDescMy(e.target.value)}
              placeholder="ဥပမာ — နှစ်စဉ် အားကစားပွဲတော်မှ အထူးအခိုက်အတန့်များ"
            />
          </Field>
        </div>
        <Button onClick={upload} disabled={uploading}>
          {uploading ? "Uploading…" : "Upload"}
        </Button>
      </Card>
      )}

      {section === "albums" && (
        albumGroups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">
          No albums yet — upload photos with an album name to create one.
        </p>
        ) : (
        <Card className="space-y-4 p-5">
          <div>
            <h3 className="font-bold text-slate-900">Edit Albums</h3>
            <p className="text-xs text-slate-500">
              Title and description changes apply to every photo in the album.
            </p>
          </div>
          {albumGroups.map(({ key, count, item }) => {
            const edit = albumValue(key, item);
            const dirty =
              edit.titleEn !== (item.album_en ?? "") ||
              edit.titleMy !== (item.album_my ?? "") ||
              edit.descEn !== (item.album_desc_en ?? "") ||
              edit.descMy !== (item.album_desc_my ?? "");
            return (
              <div key={key} className="rounded-xl border border-slate-200 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {[edit.titleEn, edit.titleMy].filter(Boolean).join(" / ") || "Untitled album"}{" "}
                  <span className="font-normal normal-case">({count} photo{count === 1 ? "" : "s"})</span>
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    value={edit.titleEn}
                    onChange={(e) => setAlbumValue(key, "titleEn", e.target.value)}
                    placeholder="Title (EN)"
                    className={inputSm}
                  />
                  <input
                    value={edit.titleMy}
                    onChange={(e) => setAlbumValue(key, "titleMy", e.target.value)}
                    placeholder="Title (MY)"
                    className={inputSm}
                  />
                  <input
                    value={edit.descEn}
                    onChange={(e) => setAlbumValue(key, "descEn", e.target.value)}
                    placeholder="Description (EN)"
                    className={inputSm}
                  />
                  <input
                    value={edit.descMy}
                    onChange={(e) => setAlbumValue(key, "descMy", e.target.value)}
                    placeholder="Description (MY)"
                    className={inputSm}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!dirty}
                    onClick={() => saveAlbum(key)}
                    className={`rounded border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      dirty
                        ? "border-brand text-brand hover:bg-brand hover:text-white"
                        : "cursor-not-allowed border-slate-200 text-slate-400"
                    }`}
                  >
                    Apply to album
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteAlbum(key)}
                    className="rounded border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    Delete album…
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
        )
      )}

      {section === "photos" && (
      <>
      <Card className="space-y-3 p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-52">
            <Field label="Album">
              <Select
                value={filterAlbum}
                onChange={(e) => setFilterAlbum(e.target.value)}
              >
                <option value="">All albums</option>
                {albumOptions.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="min-w-[200px] flex-1">
            <Field label="Search">
              <TextInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search captions or albums…"
              />
            </Field>
          </div>
          <p className="pb-2 text-xs text-slate-500">
            {filtered.length} of {items.length} photo(s)
          </p>
        </div>
      </Card>

      {/* Select all + batch toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={allFilteredSelected}
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
          />
          Select all {filtered.length} photo(s)
        </label>
        {selected.size > 0 && (
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-xs font-semibold text-slate-500 hover:underline"
          >
            Clear selection ({selected.size})
          </button>
        )}
      </div>

      {selected.size > 0 && (
        <Card className="space-y-3 border-brand/40 bg-brand/5 p-4">
          <p className="text-sm font-bold text-brand">
            {selected.size} photo(s) selected
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-44">
              <Field label="Move to album (EN)" hint="Leave empty to uncategorize.">
                <TextInput
                  value={batchAlbumEn}
                  onChange={(e) => setBatchAlbumEn(e.target.value)}
                  placeholder="e.g. Sports Day"
                />
              </Field>
            </div>
            <div className="w-44">
              <Field label="(မြန်မာ)">
                <TextInput
                  value={batchAlbumMy}
                  onChange={(e) => setBatchAlbumMy(e.target.value)}
                  placeholder="ဥပမာ — အားကစားနေ့"
                />
              </Field>
            </div>
            <Button onClick={moveSelected}>Move selected</Button>
            <Button variant="danger" onClick={deleteSelected}>
              Delete selected
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {filtered.map((item) => (
          <figure
            key={item.id}
            className={`relative overflow-hidden rounded-xl border ${
              selected.has(item.id) ? "border-brand ring-2 ring-brand/40" : "border-slate-200"
            }`}
          >
            <label className="absolute left-2 top-2 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-white/90 shadow">
              <input
                type="checkbox"
                checked={selected.has(item.id)}
                onChange={() => toggleSelected(item.id)}
                aria-label="Select photo"
                className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
              />
            </label>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt={item.caption_en ?? ""}
              className="aspect-square w-full object-cover"
            />
            <figcaption className="space-y-2 bg-slate-50 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs text-slate-600">
                  {item.caption_en || "—"}
                </span>
                <button
                  type="button"
                  onClick={() => remove(item)}
                  className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  value={item.caption_en ?? ""}
                  onChange={(e) =>
                    setItems(
                      items.map((i) =>
                        i.id === item.id ? { ...i, caption_en: e.target.value } : i,
                      ),
                    )
                  }
                  placeholder="Caption (EN)"
                  className={inputSm}
                />
                <input
                  value={item.caption_my ?? ""}
                  onChange={(e) =>
                    setItems(
                      items.map((i) =>
                        i.id === item.id ? { ...i, caption_my: e.target.value } : i,
                      ),
                    )
                  }
                  placeholder="Caption (MY)"
                  className={inputSm}
                />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  value={item.album_en ?? ""}
                  onChange={(e) =>
                    setItems(
                      items.map((i) =>
                        i.id === item.id ? { ...i, album_en: e.target.value } : i,
                      ),
                    )
                  }
                  placeholder="Album (EN)"
                  className={inputSm}
                />
                <input
                  value={item.album_my ?? ""}
                  onChange={(e) =>
                    setItems(
                      items.map((i) =>
                        i.id === item.id ? { ...i, album_my: e.target.value } : i,
                      ),
                    )
                  }
                  placeholder="Album (MY)"
                  className={inputSm}
                />
              </div>
              <button
                type="button"
                onClick={() => savePhoto(item)}
                className="w-full rounded border border-brand px-2 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
              >
                {savedId === item.id ? "Saved ✓" : "Save changes"}
              </button>
            </figcaption>
          </figure>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">
          No photos match this filter.
        </p>
      )}
      </>
      )}
    </div>
  );
}