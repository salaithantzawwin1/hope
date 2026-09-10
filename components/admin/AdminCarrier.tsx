"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { FALLBACK_CARRIER } from "@/lib/fallback-data";
import type { CarrierContent, CarrierPosition } from "@/lib/types";
import {
  Button,
  Card,
  Field,
  Notice,
  TextArea,
  TextInput,
} from "./ui";

const CARRIER_KEY = "carrier_content";

function parseJson<T>(raw: string | undefined | null): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function AdminCarrier() {
  const supabase = getSupabase();
  const [data, setData] = useState<CarrierContent>(FALLBACK_CARRIER);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!supabase) return;
      const { data: row } = await supabase
        .from("site_content")
        .select("value_en")
        .eq("key", CARRIER_KEY)
        .maybeSingle();
      if (!active) return;
      const parsed = parseJson<CarrierContent>(row?.value_en);
      if (parsed) setData({ ...FALLBACK_CARRIER, ...parsed });
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (!supabase) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const { error } = await supabase.from("site_content").upsert(
        {
          key: CARRIER_KEY,
          value_en: JSON.stringify(data),
          value_my: JSON.stringify(data),
        },
        { onConflict: "key" },
      );
      if (error) throw error;
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const updateField = (key: keyof CarrierContent, value: string) => {
    setData({ ...data, [key]: value });
  };

  const updateArrayField = (
    key: "requirements_en" | "requirements_my",
    index: number,
    value: string,
  ) => {
    const arr = [...data[key]];
    arr[index] = value;
    setData({ ...data, [key]: arr });
  };

  const addRequirement = (key: "requirements_en" | "requirements_my") => {
    setData({ ...data, [key]: [...data[key], ""] });
  };

  const removeRequirement = (
    key: "requirements_en" | "requirements_my",
    index: number,
  ) => {
    const arr = [...data[key]];
    arr.splice(index, 1);
    setData({ ...data, [key]: arr });
  };

  const updatePosition = (
    index: number,
    field: keyof CarrierPosition,
    value: string,
  ) => {
    const positions = [...data.positions];
    positions[index] = { ...positions[index], [field]: value };
    setData({ ...data, positions });
  };

  const addPosition = () => {
    setData({
      ...data,
      positions: [
        ...data.positions,
        { title_en: "", title_my: "", type_en: "", type_my: "", desc_en: "", desc_my: "" },
      ],
    });
  };

  const removePosition = (index: number) => {
    const positions = [...data.positions];
    positions.splice(index, 1);
    setData({ ...data, positions });
  };

  const updateStep = (
    key: "apply_steps_en" | "apply_steps_my",
    index: number,
    field: "title" | "desc",
    value: string,
  ) => {
    const steps = [...data[key]];
    steps[index] = { ...steps[index], [field]: value };
    setData({ ...data, [key]: steps });
  };

  const addStep = (key: "apply_steps_en" | "apply_steps_my") => {
    setData({
      ...data,
      [key]: [...data[key], { title: "", desc: "" }],
    });
  };

  const removeStep = (
    key: "apply_steps_en" | "apply_steps_my",
    index: number,
  ) => {
    const steps = [...data[key]];
    steps.splice(index, 1);
    setData({ ...data, [key]: steps });
  };

  if (!supabase) return null;
  if (!loaded) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      {error && <Notice kind="error">{error}</Notice>}
      {saved && <Notice kind="info">All changes saved ✓</Notice>}

      <p className="text-sm text-slate-500">
        Edit the Carrier (We Are Hiring) page content. Leave Burmese fields
        empty to fall back to English. Save to publish immediately.
      </p>

      {/* Hero */}
      <Card className="space-y-4 p-5">
        <p className="text-sm font-bold text-slate-900">Hero Section</p>
        <div className="grid gap-3 lg:grid-cols-2">
          <Field label="Title (EN)">
            <TextInput
              value={data.hero_title_en}
              onChange={(e) => updateField("hero_title_en", e.target.value)}
            />
          </Field>
          <Field label="Title (MY)">
            <TextInput
              value={data.hero_title_my}
              onChange={(e) => updateField("hero_title_my", e.target.value)}
            />
          </Field>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <Field label="Subtitle (EN)">
            <TextArea
              rows={2}
              value={data.hero_subtitle_en}
              onChange={(e) => updateField("hero_subtitle_en", e.target.value)}
            />
          </Field>
          <Field label="Subtitle (MY)">
            <TextArea
              rows={2}
              value={data.hero_subtitle_my}
              onChange={(e) => updateField("hero_subtitle_my", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      {/* Why Join */}
      <Card className="space-y-4 p-5">
        <p className="text-sm font-bold text-slate-900">Why Join Section</p>
        <div className="grid gap-3 lg:grid-cols-2">
          <Field label="Title (EN)">
            <TextInput
              value={data.why_title_en}
              onChange={(e) => updateField("why_title_en", e.target.value)}
            />
          </Field>
          <Field label="Title (MY)">
            <TextInput
              value={data.why_title_my}
              onChange={(e) => updateField("why_title_my", e.target.value)}
            />
          </Field>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <Field label="Text (EN)">
            <TextArea
              rows={3}
              value={data.why_text_en}
              onChange={(e) => updateField("why_text_en", e.target.value)}
            />
          </Field>
          <Field label="Text (MY)">
            <TextArea
              rows={3}
              value={data.why_text_my}
              onChange={(e) => updateField("why_text_my", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      {/* Positions */}
      <Card className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">Job Positions</p>
          <Button variant="secondary" onClick={addPosition}>
            + Add Position
          </Button>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <Field label="Section Title (EN)">
            <TextInput
              value={data.positions_title_en}
              onChange={(e) => updateField("positions_title_en", e.target.value)}
            />
          </Field>
          <Field label="Section Title (MY)">
            <TextInput
              value={data.positions_title_my}
              onChange={(e) => updateField("positions_title_my", e.target.value)}
            />
          </Field>
        </div>
        {data.positions.map((pos, i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500">Position {i + 1}</p>
              <button
                type="button"
                onClick={() => removePosition(i)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <Field label="Title (EN)">
                <TextInput
                  value={pos.title_en}
                  onChange={(e) => updatePosition(i, "title_en", e.target.value)}
                />
              </Field>
              <Field label="Title (MY)">
                <TextInput
                  value={pos.title_my}
                  onChange={(e) => updatePosition(i, "title_my", e.target.value)}
                />
              </Field>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <Field label="Type (EN)">
                <TextInput
                  value={pos.type_en}
                  onChange={(e) => updatePosition(i, "type_en", e.target.value)}
                  placeholder="e.g. Full-time, Part-time"
                />
              </Field>
              <Field label="Type (MY)">
                <TextInput
                  value={pos.type_my}
                  onChange={(e) => updatePosition(i, "type_my", e.target.value)}
                  placeholder="ဥပမာ — အပြည့်အချိန်၊ အပိုင်းအချိန်"
                />
              </Field>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <Field label="Description (EN)">
                <TextArea
                  rows={2}
                  value={pos.desc_en}
                  onChange={(e) => updatePosition(i, "desc_en", e.target.value)}
                />
              </Field>
              <Field label="Description (MY)">
                <TextArea
                  rows={2}
                  value={pos.desc_my}
                  onChange={(e) => updatePosition(i, "desc_my", e.target.value)}
                />
              </Field>
            </div>
          </div>
        ))}
      </Card>

      {/* Requirements */}
      <Card className="space-y-4 p-5">
        <p className="text-sm font-bold text-slate-900">Job Requirements</p>
        <div className="grid gap-3 lg:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500">English</p>
              <button
                type="button"
                onClick={() => addRequirement("requirements_en")}
                className="text-xs text-brand hover:underline"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {data.requirements_en.map((req, i) => (
                <div key={i} className="flex gap-2">
                  <TextInput
                    value={req}
                    onChange={(e) =>
                      updateArrayField("requirements_en", i, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeRequirement("requirements_en", i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500">မြန်မာ</p>
              <button
                type="button"
                onClick={() => addRequirement("requirements_my")}
                className="text-xs text-brand hover:underline"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {data.requirements_my.map((req, i) => (
                <div key={i} className="flex gap-2">
                  <TextInput
                    value={req}
                    onChange={(e) =>
                      updateArrayField("requirements_my", i, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeRequirement("requirements_my", i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* How to Apply */}
      <Card className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">How to Apply</p>
          <Button variant="secondary" onClick={() => addStep("apply_steps_en")}>
            + Add Step
          </Button>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <Field label="Section Title (EN)">
            <TextInput
              value={data.apply_title_en}
              onChange={(e) => updateField("apply_title_en", e.target.value)}
            />
          </Field>
          <Field label="Section Title (MY)">
            <TextInput
              value={data.apply_title_my}
              onChange={(e) => updateField("apply_title_my", e.target.value)}
            />
          </Field>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500">Steps (EN)</p>
            {data.apply_steps_en.map((step, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">Step {i + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeStep("apply_steps_en", i)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <TextInput
                  value={step.title}
                  onChange={(e) =>
                    updateStep("apply_steps_en", i, "title", e.target.value)
                  }
                  placeholder="Title"
                />
                <TextArea
                  rows={2}
                  value={step.desc}
                  onChange={(e) =>
                    updateStep("apply_steps_en", i, "desc", e.target.value)
                  }
                  placeholder="Description"
                />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500">Steps (MY)</p>
            {data.apply_steps_my.map((step, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">Step {i + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeStep("apply_steps_my", i)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <TextInput
                  value={step.title}
                  onChange={(e) =>
                    updateStep("apply_steps_my", i, "title", e.target.value)
                  }
                  placeholder="ခေါင်းစဉ်"
                />
                <TextArea
                  rows={2}
                  value={step.desc}
                  onChange={(e) =>
                    updateStep("apply_steps_my", i, "desc", e.target.value)
                  }
                  placeholder="ဖော်ပြချက်"
                />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Contact Info */}
      <Card className="space-y-4 p-5">
        <p className="text-sm font-bold text-slate-900">Contact Info</p>
        <div className="grid gap-3 lg:grid-cols-2">
          <Field label="Phone (EN)">
            <TextInput
              value={data.contact_phone_en}
              onChange={(e) => updateField("contact_phone_en", e.target.value)}
            />
          </Field>
          <Field label="Phone (MY)">
            <TextInput
              value={data.contact_phone_my}
              onChange={(e) => updateField("contact_phone_my", e.target.value)}
            />
          </Field>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <Field label="Email (EN)">
            <TextInput
              value={data.contact_email_en}
              onChange={(e) => updateField("contact_email_en", e.target.value)}
            />
          </Field>
          <Field label="Email (MY)">
            <TextInput
              value={data.contact_email_my}
              onChange={(e) => updateField("contact_email_my", e.target.value)}
            />
          </Field>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <Field label="Button Text (EN)">
            <TextInput
              value={data.contact_note_en}
              onChange={(e) => updateField("contact_note_en", e.target.value)}
            />
          </Field>
          <Field label="Button Text (MY)">
            <TextInput
              value={data.contact_note_my}
              onChange={(e) => updateField("contact_note_my", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Button onClick={save} disabled={busy}>
        {busy ? "Saving…" : "Save All Changes"}
      </Button>
    </div>
  );
}
