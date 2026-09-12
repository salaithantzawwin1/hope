"use client";

import { useEffect, useState } from "react";
import { apiSiteContent, contentApi } from "@/lib/api";
import {
  FALLBACK_CARRIER,
  normalizeCarrier,
} from "@/lib/fallback-data";
import type { CarrierContent, CarrierPosition } from "@/lib/types";
import {
  Button,
  Card,
  Field,
  SaveStatus,
  SubTabs,
  TextArea,
  TextInput,
} from "./ui";

const CARRIER_KEY = "carrier_content";

type Section = "hero" | "positions" | "defaults";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "hero", label: "Hero & Why Join" },
  { id: "positions", label: "Job Positions" },
  { id: "defaults", label: "Apply & Contact Defaults" },
];

function parseJson<T>(raw: string | undefined | null): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** A short label for a position tab (falls back through MY then a placeholder). */
function positionLabel(pos: CarrierPosition, index: number) {
  const name = pos.title_en.trim() || pos.title_my.trim();
  return name || `Job ${index + 1}`;
}

export default function AdminCarrier() {
  const [data, setData] = useState<CarrierContent>(FALLBACK_CARRIER);
  const [jobTab, setJobTab] = useState(0);
  const [section, setSection] = useState<Section>("hero");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const rows = await apiSiteContent();
      if (!active) return;
      const row = rows.find((r) => r.key === CARRIER_KEY);
      const parsed = parseJson<CarrierContent>(row?.value_en);
      if (parsed) setData(normalizeCarrier(parsed));
      setLoaded(true);
    })().catch(() => {
      if (active) setLoaded(true);
    });
    return () => {
      active = false;
    };
     
  }, []);

  const save = async () => {
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await contentApi.save({
        key: CARRIER_KEY,
        value_en: JSON.stringify(data),
        value_my: JSON.stringify(data),
      });
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

  const updatePosition = (
    index: number,
    update: Partial<CarrierPosition>,
  ) => {
    const positions = [...data.positions];
    positions[index] = { ...positions[index], ...update };
    setData({ ...data, positions });
  };

  const addPosition = () => {
    setData({
      ...data,
      positions: [
        ...data.positions,
        {
          title_en: "",
          title_my: "",
          type_en: "",
          type_my: "",
          desc_en: "",
          desc_my: "",
          requirements_en: [],
          requirements_my: [],
          active: true,
        },
      ],
    });
    setJobTab(data.positions.length);
  };

  const removePosition = (index: number) => {
    if (
      !window.confirm(
        `Remove "${positionLabel(data.positions[index], index)}"? This cannot be undone until you save.`,
      )
    )
      return;
    const positions = [...data.positions];
    positions.splice(index, 1);
    setData({ ...data, positions });
    setJobTab((tab) => Math.max(0, Math.min(tab, positions.length - 1)));
  };

  const movePosition = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= data.positions.length) return;
    const positions = [...data.positions];
    [positions[index], positions[target]] = [positions[target], positions[index]];
    setData({ ...data, positions });
    setJobTab(target);
  };

  const togglePositionActive = (index: number) => {
    updatePosition(index, { active: !data.positions[index].active });
  };

  const updateRequirement = (
    index: number,
    key: "requirements_en" | "requirements_my",
    reqIndex: number,
    value: string,
  ) => {
    const arr = [...data.positions[index][key]];
    arr[reqIndex] = value;
    updatePosition(index, { [key]: arr });
  };

  const addRequirement = (
    index: number,
    key: "requirements_en" | "requirements_my",
  ) => {
    updatePosition(index, { [key]: [...data.positions[index][key], ""] });
  };

  const removeRequirement = (
    index: number,
    key: "requirements_en" | "requirements_my",
    reqIndex: number,
  ) => {
    const arr = [...data.positions[index][key]];
    arr.splice(reqIndex, 1);
    updatePosition(index, { [key]: arr });
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

  if (!loaded) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  const pos = data.positions[jobTab];

  return (
    <div className="space-y-6">
      <SaveStatus error={error} saved={saved} />

      <p className="text-sm text-slate-500">
        Edit the Carrier (We Are Hiring) page content. Each job has its own tab
        with its own requirements — use Active/Inactive to show or hide a job        from the public page. Leave Burmese fields empty to fall back to
        English. Save to publish immediately (every tab is saved together).
      </p>
      <SubTabs
        tabs={SECTIONS}
        active={section}
        onChange={(id) => setSection(id as Section)}
      />
      {/* Hero */}
      {section === "hero" && (
      <>
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
        </div>        <div className="grid gap-3 lg:grid-cols-2">
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
      </>
      )}
      {/* Job Positions */}
      {section === "positions" && (
      <Card className="space-y-4 p-5">
        <p className="text-sm font-bold text-slate-900">Job Positions</p>
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

        {data.positions.length === 0 ? (
          <p className="text-sm text-slate-500">No jobs yet. Add one below.</p>
        ) : (
          <SubTabs
            tabs={data.positions.map((p, i) => ({
              id: String(i),
              label: positionLabel(p, i),
              dot: p.active ? "green" : "gray",
            }))}
            active={String(jobTab)}
            onChange={(id) => setJobTab(Number(id))}
          />
        )}

        {pos && (
          <div className="rounded-lg border border-slate-200 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-500">
                Job {jobTab + 1} of {data.positions.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => movePosition(jobTab, -1)}
                  disabled={jobTab === 0}
                  className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  title="Move left"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => movePosition(jobTab, 1)}
                  disabled={jobTab === data.positions.length - 1}
                  className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  title="Move right"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => togglePositionActive(jobTab)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                    pos.active
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                  }`}
                >
                  {pos.active ? "● Active" : "○ Inactive"}
                </button>
                <button
                  type="button"
                  onClick={() => removePosition(jobTab)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
            {!pos.active && (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                This job is inactive — it is hidden from the public Carrier page
                until you set it back to Active.
              </p>
            )}
            <div className="grid gap-3 lg:grid-cols-2">
              <Field label="Title (EN)">
                <TextInput
                  value={pos.title_en}
                  onChange={(e) => updatePosition(jobTab, { title_en: e.target.value })}
                />
              </Field>
              <Field label="Title (MY)">
                <TextInput
                  value={pos.title_my}
                  onChange={(e) => updatePosition(jobTab, { title_my: e.target.value })}
                />
              </Field>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <Field label="Type (EN)">
                <TextInput
                  value={pos.type_en}
                  onChange={(e) => updatePosition(jobTab, { type_en: e.target.value })}
                  placeholder="e.g. Full-time, Part-time"
                />
              </Field>
              <Field label="Type (MY)">
                <TextInput
                  value={pos.type_my}
                  onChange={(e) => updatePosition(jobTab, { type_my: e.target.value })}
                  placeholder="ဥပမာ — အပြည့်အချိန်၊ အပိုင်းအချိန်"
                />
              </Field>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <Field label="Description (EN)">
                <TextArea
                  rows={2}
                  value={pos.desc_en}
                  onChange={(e) => updatePosition(jobTab, { desc_en: e.target.value })}
                />
              </Field>
              <Field label="Description (MY)">
                <TextArea
                  rows={2}
                  value={pos.desc_my}
                  onChange={(e) => updatePosition(jobTab, { desc_my: e.target.value })}
                />
              </Field>
            </div>

            {/* Requirements for this job */}
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Job Requirements (this job)
              </p>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500">English</p>
                    <button
                      type="button"
                      onClick={() => addRequirement(jobTab, "requirements_en")}
                      className="text-xs text-brand hover:underline"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {pos.requirements_en.map((req, i) => (
                      <div key={i} className="flex gap-2">
                        <TextInput
                          value={req}
                          onChange={(e) =>
                            updateRequirement(jobTab, "requirements_en", i, e.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeRequirement(jobTab, "requirements_en", i)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {pos.requirements_en.length === 0 && (
                      <p className="text-xs text-slate-400">No requirements yet.</p>
                    )}
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500">မြန်မာ</p>
                    <button
                      type="button"
                      onClick={() => addRequirement(jobTab, "requirements_my")}
                      className="text-xs text-brand hover:underline"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {pos.requirements_my.map((req, i) => (
                      <div key={i} className="flex gap-2">
                        <TextInput
                          value={req}
                          onChange={(e) =>
                            updateRequirement(jobTab, "requirements_my", i, e.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeRequirement(jobTab, "requirements_my", i)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {pos.requirements_my.length === 0 && (
                      <p className="text-xs text-slate-400">
                        လိုအပ်ချက် မရှိသေးပါ။
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        <div>
          <Button variant="secondary" onClick={addPosition}>
            + Add Job
          </Button>
        </div>
      </Card>
      )}

      {/* How to Apply */}
      {section === "defaults" && (
      <>
      <Card className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">How to Apply (Global Defaults)</p>
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
        <p className="text-sm font-bold text-slate-900">Contact Info (Global Defaults)</p>
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
      </>
      )}

      <Button onClick={save} disabled={busy}>
        {busy ? "Saving…" : "Save All Changes"}
      </Button>
    </div>
  );
}
