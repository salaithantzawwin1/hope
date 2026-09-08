"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import type { EventItem } from "@/lib/types";
import { Button, Card, Field, Notice, TextArea, TextInput } from "./ui";

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
};

export default function AdminEvents() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const supabase = getSupabase();

  const load = async (): Promise<EventItem[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });
    if (error) return [];
    return (data ?? []) as EventItem[];
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
          }
        : EMPTY,
    );
    setEditing(true);
    setError("");
  };

  const save = async () => {
    if (!supabase) return;
    setBusy(true);
    setError("");
    try {
      const payload = {
        title_en: form.title_en.trim(),
        title_my: form.title_my.trim(),
        date: form.date,
        time: form.time.trim() || null,
        location_en: form.location_en.trim() || null,
        location_my: form.location_my.trim() || null,
        description_en: form.description_en.trim() || null,
        description_my: form.description_my.trim() || null,
      };
      if (!payload.title_en || !payload.date)
        throw new Error("English title and date are required");

      const { error } = form.id
        ? await supabase.from("events").update(payload).eq("id", form.id)
        : await supabase.from("events").insert(payload);
      if (error) throw error;

      setEditing(false);
      setForm(EMPTY);
      setItems(await load());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item: EventItem) => {
    if (!supabase) return;
    if (!window.confirm(`Delete "${item.title_en}"?`)) return;
    const { error } = await supabase.from("events").delete().eq("id", item.id);
    if (!error) setItems(await load());
  };

  if (!supabase) return null;

  return (
    <div className="space-y-6">
      {error && <Notice kind="error">{error}</Notice>}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{items.length} event(s)</p>
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
          <div className="flex gap-2">
            <Button onClick={save} disabled={busy}>
              Save
            </Button>
            <Button variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">
                {item.title_en || "(no title)"}
              </p>
              <p className="text-xs text-slate-500">
                {item.date}
                {item.time ? ` · ${item.time}` : ""}
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
    </div>
  );
}