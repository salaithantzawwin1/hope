"use client";

import { useEffect, useState } from "react";
import { apiSiteContent, contentApi } from "@/lib/api";
import { FALLBACK_REGISTER } from "@/lib/fallback-data";
import { REGISTRATION_EMAIL } from "@/lib/registration";
import type { RegisterContent, RegisterStep } from "@/lib/types";
import { LangRow } from "./bilingual";
import { Button, Card, Field, SaveStatus, SubTabs, TextInput } from "./ui";

const KEY = "register_content";

type Section = "intro" | "steps" | "questions";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "intro", label: "Page Intro" },
  { id: "steps", label: "\"What happens next?\" Steps" },
  { id: "questions", label: "Questions Box" },
];

function parseJson<T>(raw: string | undefined | null): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function AdminRegister() {
  const [data, setData] = useState<RegisterContent>(FALLBACK_REGISTER);
  const [section, setSection] = useState<Section>("intro");
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
      const parsed = parseJson<RegisterContent>(row?.value_en);
      if (parsed) {
        // Spread over the fallback so a block saved before a field existed
        // still renders every input.
        setData({ ...FALLBACK_REGISTER, ...parsed });
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

  const patch = (p: Partial<RegisterContent>) => setData({ ...data, ...p });

  const updateStep = (i: number, p: Partial<RegisterStep>) =>
    patch({
      steps: data.steps.map((s, j) => (j === i ? { ...s, ...p } : s)),
    });

  const moveStep = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= data.steps.length) return;
    const steps = [...data.steps];
    [steps[i], steps[j]] = [steps[j], steps[i]];
    patch({ steps });
  };

  if (!loaded) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <SaveStatus error={error} saved={saved} />

      <p className="text-sm text-slate-500">
        The Register page: the intro line, the numbered &quot;what happens
        next&quot; steps and the contact box beside the form. Leave the Burmese
        field empty to fall back to English. Save to publish immediately (every
        tab is saved together).
      </p>

      <SubTabs
        tabs={SECTIONS.map(({ id, label }) => ({ id, label }))}
        active={section}
        onChange={(id) => setSection(id as Section)}
      />

      {section === "intro" && (
        <Card className="space-y-4 p-5">
          <div>
            <p className="text-sm font-bold text-slate-900">Page intro</p>
            <p className="text-xs text-slate-500">
              Shown under the page title in the dark banner.
            </p>
          </div>
          <LangRow
            label="Intro text"
            en={data.intro_en}
            my={data.intro_my}
            textarea
            onEn={(v) => patch({ intro_en: v })}
            onMy={(v) => patch({ intro_my: v })}
          />
        </Card>
      )}

      {section === "steps" && (
        <Card className="space-y-4 p-5">
          <div>
            <p className="text-sm font-bold text-slate-900">
              &quot;What happens next?&quot;
            </p>
            <p className="text-xs text-slate-500">
              The numbered steps above the form. Steps are numbered
              automatically in the order shown here.
            </p>
          </div>

          <LangRow
            label="Section heading"
            en={data.steps_title_en}
            my={data.steps_title_my}
            onEn={(v) => patch({ steps_title_en: v })}
            onMy={(v) => patch({ steps_title_my: v })}
          />

          <div className="space-y-3">
            {data.steps.map((step, i) => (
              <div
                key={i}
                className="space-y-3 rounded-lg border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Step {i + 1}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={i === 0}
                      onClick={() => moveStep(i, -1)}
                      aria-label={`Move step ${i + 1} up`}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={i === data.steps.length - 1}
                      onClick={() => moveStep(i, 1)}
                      aria-label={`Move step ${i + 1} down`}
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
                      Remove
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
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              patch({
                steps: [
                  ...data.steps,
                  {
                    title_en: "",
                    title_my: "",
                    desc_en: "",
                    desc_my: "",
                  },
                ],
              })
            }
          >
            + Add step
          </Button>
        </Card>
      )}

      {section === "questions" && (
        <Card className="space-y-4 p-5">
          <div>
            <p className="text-sm font-bold text-slate-900">Questions box</p>
            <p className="text-xs text-slate-500">
              The card beside the form. Its email is also the address shown
              when a registration could not be sent, so visitors always write
              to the same place.
            </p>
          </div>
          <LangRow
            label="Box heading"
            en={data.questions_title_en}
            my={data.questions_title_my}
            onEn={(v) => patch({ questions_title_en: v })}
            onMy={(v) => patch({ questions_title_my: v })}
          />
          <LangRow
            label="Box text"
            en={data.questions_text_en}
            my={data.questions_text_my}
            textarea
            onEn={(v) => patch({ questions_text_en: v })}
            onMy={(v) => patch({ questions_text_my: v })}
          />
          <Field
            label="Contact email"
            hint={`Shown on the button. Leave empty to keep ${REGISTRATION_EMAIL}.`}
          >
            <TextInput
              type="email"
              value={data.contact_email}
              onChange={(e) => patch({ contact_email: e.target.value })}
              placeholder={REGISTRATION_EMAIL}
            />
          </Field>
        </Card>
      )}

      <Button onClick={saveAll} disabled={busy}>
        {busy ? "Saving…" : "Save All Changes"}
      </Button>
    </div>
  );
}
