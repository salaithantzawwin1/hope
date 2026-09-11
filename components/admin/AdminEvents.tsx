"use client";

import { useEffect, useState } from "react";
import { apiEvents, eventsApi, type EventInput } from "@/lib/api";
import { uploadImage } from "@/lib/upload";
import type { EventItem } from "@/lib/types";
import { Button, Card, Field, Notice, SubTabs, TextArea, TextInput } from "./ui";

interface FormState {
  id: string | null;
  title_en: string;
  title_my: string;
  date: string;
  time: string;
  location_en: string;
  location_my: string;
  description_en: string;
  description_my: string;
  image_url: string;
}

const EMPTY: FormState = {
  id: null,
  title_en: "",
  title_my: "",
  date: new Date().toISOString().slice(0, 10),
  time: "",
  location_en: "",
  location_my: "",
  description_en: "",
  description_my: "",
  image_url: "",
};

type EventsSection = "upcoming" | "past";

const EVENTS_SECTIONS: { id: EventsSection; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

export default function AdminEvents() {
  const [section, setSection] = useState<EventsSection>("upcoming");
  const [items, setItems] = useState<EventItem[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async (): Promise<EventItem[]> => {
    try {
      return await apiEvents();
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

  const startEdit = (item?: EventItem) => {
    setForm(
      item
        ? {
            id: item.id,
            title_en: item.title_en,
            title_my: item.title_my,
            date: item.date.slice(0, 10),
            time: item.time ?? "",
            location_en: item.location_en ?? "",
            location_my: item.location_my ?? "",
            description_en: item.description_en ?? "",
            description_my: item.description_my ?? "",
            image_url: item.image_url ?? "",
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
        imageUrl = await uploadImage(imageFile, "events");
      }
      const payload = {
        title_en: form.title_en.trim(),
        title_my: form.title_my.trim(),
        date: form.date,
        time: form.time.trim() || null,
        location_en: form.location_en.trim() || null,
        location_my: form.location_my.trim() || null,
        description_en: form.description_en.trim() || null,
        description_my: form.description_my.trim() || null,
        image_url: imageUrl || null,
      };
      if (!payload.title_en || !payload.date)
        throw new Error("English title and date are required");

      if (form.id) await eventsApi.update(form.id, payload as EventInput);
      else await eventsApi.create(payload as EventInput);

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

  const remove = async (item: EventItem) => {
    if (!window.confirm(`Delete "${item.title_en}"?`)) return;
    try {
      await eventsApi.remove(item.id);
      setItems(await load());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  // Split by date so staff can focus on what is coming up vs. what has
  // already happened (past is shown most-recent-first).
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = items.filter((i) => i.date >= today);
  const past = [...items.filter((i) => i.date < today)].reverse();
  const visible = section === "upcoming" ? upcoming : past;

  const sectionTabs = EVENTS_SECTIONS.map((s) => ({
    id: s.id,
    label: `${s.label} (${s.id === "upcoming" ? upcoming.length : past.length})`,
  }));

  return (
    <div className="space-y-6">
      {error && <Notice kind="error">{error}</Notice>}

      <SubTabs
        tabs={sectionTabs}
        active={section}
        onChange={(id) => setSection(id as EventsSection)}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{visible.length} event(s)</p>
        <Button onClick={() => startEdit()}>+ New Event</Button>
      </div>

      {editing && (
        <Card className="space-y-4 p-5">
          <h3 className="font-bold text-slate-900">
            {form.id ? "Edit Event" : "New Event"}
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
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Date *">
              <TextInput
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Field>
            <Field label="Time" hint="e.g. 9:00 AM – 12:00 PM">
              <TextInput
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </Field>
            <Field label="Location (English)">
              <TextInput
                value={form.location_en}
                onChange={(e) => setForm({ ...form, location_en: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Location (မြန်မာ)">
            <TextInput
              value={form.location_my}
              onChange={(e) => setForm({ ...form, location_my: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Description (English)">
              <TextArea
                rows={3}
                value={form.description_en}
                onChange={(e) => setForm({ ...form, description_en: e.target.value })}
              />
            </Field>
            <Field label="Description (မြန်မာ)">
              <TextArea
                rows={3}
                value={form.description_my}
                onChange={(e) => setForm({ ...form, description_my: e.target.value })}
              />
            </Field>
          </div>
          <Field
            label="Flyer / poster image"
            hint="JPEG/PNG — automatically resized. Visitors click it to open full size. Optional."
          >
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
            <div className="flex min-w-0 items-center gap-3">
              {item.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_url}
                  alt=""
                  className="h-10 w-8 shrink-0 rounded border border-slate-200 object-cover"
                />
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {item.title_en || "(no title)"}
                </p>
                <p className="text-xs text-slate-500">
                  {item.date}
                  {item.time ? ` · ${item.time}` : ""}
                </p>
              </div>
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
          {section === "upcoming"
            ? "No upcoming events — click \u201c+ New Event\u201d to add one."
            : "No past events yet."}
        </p>
      )}
    </div>
  );
}