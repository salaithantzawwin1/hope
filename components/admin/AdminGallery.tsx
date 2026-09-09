"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";
import type { GalleryImage } from "@/lib/types";
import { Button, Card, Field, Notice, TextInput } from "./ui";

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

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [captionEn, setCaptionEn] = useState("");
  const [captionMy, setCaptionMy] = useState("");
  const [albumEn, setAlbumEn] = useState("");
  const [albumMy, setAlbumMy] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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
        });
        if (error) throw error;
      }
      setFiles([]);
      setCaptionEn("");
      setCaptionMy("");
      setAlbumEn("");
      setAlbumMy("");
      setItems(await load());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveAlbum = async (item: GalleryImage) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("gallery")
      .update({
        album_en: item.album_en?.trim() || null,
        album_my: item.album_my?.trim() || null,
      })
      .eq("id", item.id);
    if (error) {
      setError(error.message);
    } else {
      setError("");
      setItems(await load());
    }
  };

  const remove = async (item: GalleryImage) => {
    if (!supabase) return;
    if (!window.confirm("Delete this photo?")) return;
    const { error } = await supabase.from("gallery").delete().eq("id", item.id);
    if (!error) setItems(await load());
  };

  if (!supabase) return null;

  return (
    <div className="space-y-6">
      {error && <Notice kind="error">{error}</Notice>}

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
                  onRemove={() =>
                    setFiles(files.filter((_, j) => j !== i))
                  }
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
        <Button onClick={upload} disabled={uploading}>
          {uploading ? "Uploading…" : "Upload"}
        </Button>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <figure key={item.id} className="overflow-hidden rounded-xl border border-slate-200">
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
              <div className="flex items-center gap-1.5">
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
                  className="min-w-0 w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-brand focus:outline-none"
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
                  className="min-w-0 w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-brand focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => saveAlbum(item)}
                  className="shrink-0 rounded border border-brand px-2 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
                >
                  Save
                </button>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}