"use client";

import { useEffect, useState } from "react";
import { apiNews, newsApi, type NewsInput } from "@/lib/api";
import { uploadImage } from "@/lib/upload";
import type { NewsItem } from "@/lib/types";
import { Button, Card, Field, SaveStatus, SubTabs, TextArea, TextInput } from "./ui";

interface FormState {
  id: string | null;
  title_en: string;
  title_my: string;
  body_en: string;
  body_my: string;
  image_url: string;
  published_at: string;
}

const EMPTY: FormState = {
  id: null,
  title_en: "",
  title_my: "",
  body_en: "",
  body_my: "",
  image_url: "",
  published_at: new Date().toISOString().slice(0, 10),
};

type NewsSection = "all" | string;

export default function AdminNews() {
  const [section, setSection] = useState<NewsSection>("all");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async (): Promise<NewsItem[]> => {
    try {
      return await apiNews();
    } catch {
      return [];
    }
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
     
  }, []);

  const startEdit = (item?: NewsItem) => {
    setForm(
      item
        ? {
            id: item.id,
            title_en: item.title_en,
            title_my: item.title_my,
            body_en: item.body_en,
            body_my: item.body_my,
            image_url: item.image_url ?? "",
            published_at: item.published_at.slice(0, 10),
          }
        : EMPTY,
    );
    setImageFile(null);
    setEditing(true);
    setError("");
  };

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      let imageUrl = form.image_url;
      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadImage(imageFile, "news");
      }
      const input: NewsInput = {
        title_en: form.title_en.trim(),
        title_my: form.title_my.trim(),
        body_en: form.body_en.trim(),
        body_my: form.body_my.trim(),
        image_url: imageUrl || null,
        published_at: form.published_at,
      };
      if (!input.title_en) throw new Error("English title is required");

      if (form.id) await newsApi.update(form.id, input);
      else await newsApi.create(input);

      setEditing(false);
      setForm(EMPTY);
      setImageFile(null);
      setItems(await load());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setUploading(false);
      setBusy(false);
    }
  };

  const remove = async (item: NewsItem) => {
    if (!window.confirm(`Delete "${item.title_en}"?`)) return;
    try {
      await newsApi.remove(item.id);
      setItems(await load());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  // Group posts by publication year so staff can browse the archive.
  const years = Array.from(
    new Set(items.map((i) => i.published_at.slice(0, 4)).filter((y) => /^\d{4}$/.test(y))),
  ).sort((a, b) => b.localeCompare(a));
  const visible =
    section === "all" ? items : items.filter((i) => i.published_at.slice(0, 4) === section);

  const sectionTabs = [
    { id: "all", label: `All (${items.length})` },
    ...years.map((year) => ({
      id: year,
      label: `${year} (${items.filter((i) => i.published_at.slice(0, 4) === year).length})`,
    })),
  ];

  return (
    <div className="space-y-6">
      <SaveStatus error={error} />

      <SubTabs
        tabs={sectionTabs}
        active={section}
        onChange={(id) => setSection(id)}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{visible.length} post(s)</p>
        <Button onClick={() => startEdit()}>+ New Post</Button>
      </div>

      {editing && (
        <Card className="space-y-4 p-5">
          <h3 className="font-bold text-slate-900">
            {form.id ? "Edit Post" : "New Post"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title (English) *">
              <TextInput
                value={form.title_en}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
              />
            </Field>
            <Field label="Title (မြန်မာ)">
              <TextInput
                value={form.title_my}
                onChange={(e) => setForm({ ...form, title_my: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Body (English)">
              <TextArea
                rows={4}
                value={form.body_en}
                onChange={(e) => setForm({ ...form, body_en: e.target.value })}
              />
            </Field>
            <Field label="Body (မြန်မာ)">
              <TextArea
                rows={4}
                value={form.body_my}
                onChange={(e) => setForm({ ...form, body_my: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Published date">
              <TextInput
                type="date"
                value={form.published_at}
                onChange={(e) => setForm({ ...form, published_at: e.target.value })}
              />
            </Field>
            <Field label="Cover image" hint="JPEG/PNG — automatically resized. Optional.">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700"
              />
              {form.image_url && (
                <span className="mt-1 block text-xs text-slate-400">
                  Current: {form.image_url}
                </span>
              )}
            </Field>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={busy || uploading}>
              {uploading ? "Uploading…" : "Save"}
            </Button>
            <Button variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {visible.map((item) => (
          <Card key={item.id} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">
                {item.title_en || "(no title)"}
              </p>
              <p className="text-xs text-slate-500">
                {item.published_at.slice(0, 10)}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="secondary" onClick={() => startEdit(item)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => remove(item)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">
          {section === "all"
            ? "No posts yet — click \u201c+ New Post\u201d to add one."
            : `No posts published in ${section}.`}
        </p>
      )}
    </div>
  );
}