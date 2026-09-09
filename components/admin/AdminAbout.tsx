"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import {
  FALLBACK_ABOUT_FACTS,
  FALLBACK_ABOUT_MISSION_VISION,
  FALLBACK_ABOUT_VALUES,
} from "@/lib/fallback-data";
import type {
  AboutFact,
  AboutFacts,
  AboutMissionVision,
  AboutValue,
  AboutValues,
} from "@/lib/types";
import { LangRow } from "./bilingual";
import { Button, Card, Notice } from "./ui";

const MISSION_VISION_KEY = "about_mission_vision";
const VALUES_KEY = "about_values";
const FACTS_KEY = "about_facts";

function parseJson<T>(raw: string | undefined | null): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function AdminAbout() {
  const supabase = getSupabase();
  const [missionVision, setMissionVision] = useState<AboutMissionVision>(
    FALLBACK_ABOUT_MISSION_VISION,
  );
  const [values, setValues] = useState<AboutValues>(FALLBACK_ABOUT_VALUES);
  const [facts, setFacts] = useState<AboutFacts>(FALLBACK_ABOUT_FACTS);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from("site_content")
        .select("key, value_en")
        .in("key", [MISSION_VISION_KEY, VALUES_KEY, FACTS_KEY]);
      if (!active) return;
      const map = new Map<string, string>((data ?? []).map((r) => [r.key, r.value_en]));
      const mv = parseJson<AboutMissionVision>(map.get(MISSION_VISION_KEY));
      const v = parseJson<AboutValues>(map.get(VALUES_KEY));
      const f = parseJson<AboutFacts>(map.get(FACTS_KEY));
      setMissionVision(mv ?? FALLBACK_ABOUT_MISSION_VISION);
      setValues(v ?? FALLBACK_ABOUT_VALUES);
      setFacts(f ?? FALLBACK_ABOUT_FACTS);
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveAll = async () => {
    if (!supabase) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const rows = [
        { key: MISSION_VISION_KEY, value_en: JSON.stringify(missionVision), value_my: JSON.stringify(missionVision) },
        { key: VALUES_KEY, value_en: JSON.stringify(values), value_my: JSON.stringify(values) },
        { key: FACTS_KEY, value_en: JSON.stringify(facts), value_my: JSON.stringify(facts) },
      ];
      for (const row of rows) {
        const { error } = await supabase
          .from("site_content")
          .upsert(row, { onConflict: "key" });
        if (error) throw error;
      }
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const updateValue = (i: number, patch: Partial<AboutValue>) =>
    setValues({
      ...values,
      values: values.values.map((v, j) => (j === i ? { ...v, ...patch } : v)),
    });

  const updateFact = (i: number, patch: Partial<AboutFact>) =>
    setFacts({
      ...facts,
      facts: facts.facts.map((f, j) => (j === i ? { ...f, ...patch } : f)),
    });

  if (!supabase) return null;
  if (!loaded) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      {error && <Notice kind="error">{error}</Notice>}
      {saved && <Notice kind="info">All changes saved ✓</Notice>}

      <p className="text-sm text-slate-500">
        These sections appear on the About page. Leave the Burmese field empty
        to fall back to English. Save to publish immediately.
      </p>

      {/* Mission & vision */}
      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">Mission &amp; Vision</p>
          <p className="text-xs text-slate-500">
            The two cards at the top of the About page.
          </p>
        </div>
        <LangRow
          label="Mission title"
          en={missionVision.mission_title_en}
          my={missionVision.mission_title_my}
          onEn={(v) => setMissionVision({ ...missionVision, mission_title_en: v })}
          onMy={(v) => setMissionVision({ ...missionVision, mission_title_my: v })}
        />
        <LangRow
          label="Mission text"
          en={missionVision.mission_text_en}
          my={missionVision.mission_text_my}
          textarea
          onEn={(v) => setMissionVision({ ...missionVision, mission_text_en: v })}
          onMy={(v) => setMissionVision({ ...missionVision, mission_text_my: v })}
        />
        <LangRow
          label="Vision title"
          en={missionVision.vision_title_en}
          my={missionVision.vision_title_my}
          onEn={(v) => setMissionVision({ ...missionVision, vision_title_en: v })}
          onMy={(v) => setMissionVision({ ...missionVision, vision_title_my: v })}
        />
        <LangRow
          label="Vision text"
          en={missionVision.vision_text_en}
          my={missionVision.vision_text_my}
          textarea
          onEn={(v) => setMissionVision({ ...missionVision, vision_text_en: v })}
          onMy={(v) => setMissionVision({ ...missionVision, vision_text_my: v })}
        />
      </Card>

      {/* Core values */}
      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">Core Values</p>
          <p className="text-xs text-slate-500">The value cards on the About page.</p>
        </div>
        <LangRow
          label="Section title"
          en={values.title_en}
          my={values.title_my}
          onEn={(v) => setValues({ ...values, title_en: v })}
          onMy={(v) => setValues({ ...values, title_my: v })}
        />
        <div className="space-y-3">
          {values.values.map((value, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Value {i + 1}
                </p>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() =>
                    setValues({
                      ...values,
                      values: values.values.filter((_, j) => j !== i),
                    })
                  }
                >
                  Remove
                </Button>
              </div>
              <LangRow
                label="Title"
                en={value.title_en}
                my={value.title_my}
                onEn={(v) => updateValue(i, { title_en: v })}
                onMy={(v) => updateValue(i, { title_my: v })}
              />
              <LangRow
                label="Description"
                en={value.desc_en}
                my={value.desc_my}
                textarea
                onEn={(v) => updateValue(i, { desc_en: v })}
                onMy={(v) => updateValue(i, { desc_my: v })}
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setValues({
              ...values,
              values: [
                ...values.values,
                { title_en: "", title_my: "", desc_en: "", desc_my: "" },
              ],
            })
          }
        >
          + Add value
        </Button>
      </Card>

      {/* School facts */}
      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">School Facts</p>
          <p className="text-xs text-slate-500">
            The numbered stats (&quot;Our School at a Glance&quot;).
          </p>
        </div>
        <LangRow
          label="Section title"
          en={facts.title_en}
          my={facts.title_my}
          onEn={(v) => setFacts({ ...facts, title_en: v })}
          onMy={(v) => setFacts({ ...facts, title_my: v })}
        />
        <div className="space-y-3">
          {facts.facts.map((fact, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Stat {i + 1}
                </p>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() =>
                    setFacts({
                      ...facts,
                      facts: facts.facts.filter((_, j) => j !== i),
                    })
                  }
                >
                  Remove
                </Button>
              </div>
              <LangRow
                label="Number"
                en={fact.number_en}
                my={fact.number_my}
                onEn={(v) => updateFact(i, { number_en: v })}
                onMy={(v) => updateFact(i, { number_my: v })}
              />
              <LangRow
                label="Label"
                en={fact.label_en}
                my={fact.label_my}
                onEn={(v) => updateFact(i, { label_en: v })}
                onMy={(v) => updateFact(i, { label_my: v })}
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setFacts({
              ...facts,
              facts: [
                ...facts.facts,
                { number_en: "", number_my: "", label_en: "", label_my: "" },
              ],
            })
          }
        >
          + Add stat
        </Button>
      </Card>

      <Button onClick={saveAll} disabled={busy}>
        {busy ? "Saving…" : "Save All Changes"}
      </Button>
    </div>
  );
}