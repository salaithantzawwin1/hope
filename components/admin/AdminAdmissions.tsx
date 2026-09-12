"use client";

import { useEffect, useState } from "react";
import { apiSiteContent, contentApi } from "@/lib/api";
import { FALLBACK_ADMISSIONS } from "@/lib/fallback-data";
import type {
  AdmissionsContent,
  AdmissionFee,
  AdmissionStep,
} from "@/lib/types";
import { LangRow } from "./bilingual";
import { Button, Card, SaveStatus, SubTabs, TextInput } from "./ui";

const KEY = "admissions_content";

type Section = "apply" | "documents" | "fees";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "apply", label: "How to Apply — Steps" },
  { id: "documents", label: "Required Documents" },
  { id: "fees", label: "Fees Table" },
];

function parseJson<T>(raw: string | undefined | null): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function AdminAdmissions() {
  const [data, setData] = useState<AdmissionsContent>(FALLBACK_ADMISSIONS);
  const [section, setSection] = useState<Section>("apply");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const rows = await apiSiteContent();
      if (!active) return;
      const row = rows.find((r) => r.key === KEY);
      const parsed = parseJson<AdmissionsContent>(row?.value_en);
      if (parsed) {
        // Spread over the fallback so blocks saved by older versions of the
        // portal (missing new fields) still render every input.
        setData({ ...FALLBACK_ADMISSIONS, ...parsed });
      }
      setLoaded(true);
    })().catch(() => {
      if (active) setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const saveAll = async () => {
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await contentApi.save([
        {
          key: KEY,
          value_en: JSON.stringify(data),
          value_my: JSON.stringify(data),
        },
      ]);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const patch = (p: Partial<AdmissionsContent>) => setData({ ...data, ...p });

  const updateStep = (i: number, p: Partial<AdmissionStep>) =>
    patch({
      steps: data.steps.map((s, j) => (j === i ? { ...s, ...p } : s)),
    });

  const updateFee = (i: number, p: Partial<AdmissionFee>) =>
    patch({
      fees: data.fees.map((f, j) => (j === i ? { ...f, ...p } : f)),
    });

  const moveItem = <T,>(list: T[], i: number, dir: -1 | 1): T[] => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return list;
    const copy = [...list];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    return copy;
  };

  if (!loaded) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <SaveStatus error={error} saved={saved} />

      <p className="text-sm text-slate-500">
        The Admissions page: intro, &quot;How to Apply&quot; steps, required
        documents and the fees table — organised into tabs. Leave the Burmese
        field empty to fall back to English. Save to publish immediately
        (every tab is saved together).
      </p>
      {/* Intro (shared across tabs) */}
      <Card className="space-y-4 p-5">
        <p className="text-sm font-bold text-slate-900">Intro</p>
        <LangRow
          label="Intro text"
          en={data.intro_en}
          my={data.intro_my}
          textarea
          onEn={(v) => patch({ intro_en: v })}
          onMy={(v) => patch({ intro_my: v })}
        />
      </Card>
      <SubTabs
        tabs={SECTIONS}
        active={section}
        onChange={(id) => setSection(id as Section)}
      />
      {/* Steps */}
      {section === "apply" && (
      <Card className="space-y-4 p-5">
        <p className="text-sm font-bold text-slate-900">How to Apply — steps</p>
        <LangRow
          label="Section title"
          en={data.steps_title_en}
          my={data.steps_title_my}
          onEn={(v) => patch({ steps_title_en: v })}
          onMy={(v) => patch({ steps_title_my: v })}
        />
        <div className="space-y-3">
          {data.steps.map((step, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Step {i + 1}
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={i === 0}
                    onClick={() => patch({ steps: moveItem(data.steps, i, -1) })}
                    title="Move up"
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={i === data.steps.length - 1}
                    onClick={() => patch({ steps: moveItem(data.steps, i, 1) })}
                    title="Move down"
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() =>
                      patch({ steps: data.steps.filter((_, j) => j !== i) })
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <LangRow
                label="Title"
                en={step.title_en}
                my={step.title_my}
                onEn={(v) => updateStep(i, { title_en: v })}
                onMy={(v) => updateStep(i, { title_my: v })}
              />
              <LangRow
                label="Description"
                en={step.desc_en}
                my={step.desc_my}
                textarea
                onEn={(v) => updateStep(i, { desc_en: v })}
                onMy={(v) => updateStep(i, { desc_my: v })}
              />
            </div>
          ))}
        </div>        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            patch({
              steps: [
                ...data.steps,
                { title_en: "", title_my: "", desc_en: "", desc_my: "" },
              ],
            })
          }
        >
          + Add step
        </Button>
      </Card>
      )}
      {/* Requirements */}
      {section === "documents" && (
      <Card className="space-y-4 p-5">
        <p className="text-sm font-bold text-slate-900">Required documents</p>
        <LangRow
          label="Section title"
          en={data.requirements_title_en}
          my={data.requirements_title_my}
          onEn={(v) => patch({ requirements_title_en: v })}
          onMy={(v) => patch({ requirements_title_my: v })}
        />
        <p className="text-xs text-slate-500">
          One document per row — keep the English and Burmese lists in the same
          order.
        </p>
        <div className="space-y-2">
          {data.requirements_en.map((reqEn, i) => (
            <div key={i} className="grid items-center gap-2 lg:grid-cols-[1fr_1fr_auto]">
              <TextInput
                value={reqEn}
                placeholder="English"
                onChange={(e) =>
                  patch({
                    requirements_en: data.requirements_en.map((x, j) =>
                      j === i ? e.target.value : x,
                    ),
                  })
                }
              />
              <TextInput
                value={data.requirements_my[i] ?? ""}
                placeholder="မြန်မာ"
                onChange={(e) =>
                  patch({
                    requirements_my: data.requirements_my.map((x, j) =>
                      j === i ? e.target.value : x,
                    ),
                  })
                }
              />
              <Button
                type="button"
                variant="danger"
                onClick={() =>
                  patch({
                    requirements_en: data.requirements_en.filter((_, j) => j !== i),
                    requirements_my: data.requirements_my.filter((_, j) => j !== i),
                  })
                }
              >
                ✕
              </Button>
            </div>
          ))}
        </div>        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            patch({
              requirements_en: [...data.requirements_en, ""],
              requirements_my: [...data.requirements_my, ""],
            })
          }
        >
          + Add document
        </Button>
      </Card>
      )}
      {/* Fees */}
      {section === "fees" && (
      <Card className="space-y-4 p-5">
        <p className="text-sm font-bold text-slate-900">Fees table</p>
        <LangRow
          label="Section title"
          en={data.fees_title_en}
          my={data.fees_title_my}
          onEn={(v) => patch({ fees_title_en: v })}
          onMy={(v) => patch({ fees_title_my: v })}
        />
        <LangRow
          label="Subtitle"
          en={data.fees_subtitle_en}
          my={data.fees_subtitle_my}
          textarea
          onEn={(v) => patch({ fees_subtitle_en: v })}
          onMy={(v) => patch({ fees_subtitle_my: v })}
        />
        <div className="space-y-3">
          {data.fees.map((fee, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Row {i + 1}
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={i === 0}
                    onClick={() => patch({ fees: moveItem(data.fees, i, -1) })}
                    title="Move up"
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={i === data.fees.length - 1}
                    onClick={() => patch({ fees: moveItem(data.fees, i, 1) })}
                    title="Move down"
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() =>
                      patch({ fees: data.fees.filter((_, j) => j !== i) })
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <LangRow
                label="Level / Programme"
                en={fee.level_en}
                my={fee.level_my}
                onEn={(v) => updateFee(i, { level_en: v })}
                onMy={(v) => updateFee(i, { level_my: v })}
              />
              <LangRow
                label="Annual tuition"
                en={fee.fee_en}
                my={fee.fee_my}
                onEn={(v) => updateFee(i, { fee_en: v })}
                onMy={(v) => updateFee(i, { fee_my: v })}
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            patch({
              fees: [
                ...data.fees,
                { level_en: "", level_my: "", fee_en: "", fee_my: "" },
              ],
            })
          }
        >
          + Add fee row
        </Button>        <LangRow
          label="Note under the table"
          en={data.fees_note_en}
          my={data.fees_note_my}
          textarea
          onEn={(v) => patch({ fees_note_en: v })}
          onMy={(v) => patch({ fees_note_my: v })}
        />
      </Card>
      )}
      <Button onClick={saveAll} disabled={busy}>
        {busy ? "Saving…" : "Save All Changes"}
      </Button>
    </div>
  );
}
