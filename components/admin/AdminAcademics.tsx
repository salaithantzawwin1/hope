"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import {
  FALLBACK_ACADEMICS_CURRICULUM,
  FALLBACK_ACADEMICS_LEVELS,
  FALLBACK_ACADEMICS_PROGRAMS,
} from "@/lib/fallback-data";
import type {
  AcademicsCurriculum,
  AcademicsLevel,
  AcademicsLevels,
  AcademicsProgram,
  AcademicsPrograms,
} from "@/lib/types";
import { LangRow, PointsEditor } from "./bilingual";
import { Button, Card, Notice } from "./ui";

const CURRICULUM_KEY = "academics_curriculum";
const LEVELS_KEY = "academics_levels";
const PROGRAMS_KEY = "academics_programs";

function parseJson<T>(raw: string | undefined | null): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function AdminAcademics() {
  const supabase = getSupabase();
  const [curriculum, setCurriculum] = useState<AcademicsCurriculum>(
    FALLBACK_ACADEMICS_CURRICULUM,
  );
  const [levels, setLevels] = useState<AcademicsLevels>(FALLBACK_ACADEMICS_LEVELS);
  const [programs, setPrograms] = useState<AcademicsPrograms>(
    FALLBACK_ACADEMICS_PROGRAMS,
  );
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
        .in("key", [CURRICULUM_KEY, LEVELS_KEY, PROGRAMS_KEY]);
      if (!active) return;
      const map = new Map<string, string>((data ?? []).map((r) => [r.key, r.value_en]));
      const c = parseJson<AcademicsCurriculum>(map.get(CURRICULUM_KEY));
      const l = parseJson<AcademicsLevels>(map.get(LEVELS_KEY));
      const p = parseJson<AcademicsPrograms>(map.get(PROGRAMS_KEY));
      setCurriculum(c ?? FALLBACK_ACADEMICS_CURRICULUM);
      setLevels(l ?? FALLBACK_ACADEMICS_LEVELS);
      setPrograms(p ?? FALLBACK_ACADEMICS_PROGRAMS);
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
        { key: CURRICULUM_KEY, value_en: JSON.stringify(curriculum), value_my: JSON.stringify(curriculum) },
        { key: LEVELS_KEY, value_en: JSON.stringify(levels), value_my: JSON.stringify(levels) },
        { key: PROGRAMS_KEY, value_en: JSON.stringify(programs), value_my: JSON.stringify(programs) },
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

  const updateLevel = (i: number, patch: Partial<AcademicsLevel>) =>
    setLevels({
      ...levels,
      levels: levels.levels.map((l, j) => (j === i ? { ...l, ...patch } : l)),
    });

  const updateProgram = (i: number, patch: Partial<AcademicsProgram>) =>
    setPrograms({
      ...programs,
      programs: programs.programs.map((p, j) => (j === i ? { ...p, ...patch } : p)),
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
        These sections appear on the Academics page. Leave the Burmese field
        empty to fall back to English. Save to publish immediately.
      </p>

      {/* Curriculum */}
      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">International Curriculum</p>
          <p className="text-xs text-slate-500">
            Section title, intro text and the bullet-point list.
          </p>
        </div>
        <LangRow
          label="Title"
          en={curriculum.title_en}
          my={curriculum.title_my}
          onEn={(v) => setCurriculum({ ...curriculum, title_en: v })}
          onMy={(v) => setCurriculum({ ...curriculum, title_my: v })}
        />
        <LangRow
          label="Intro text"
          en={curriculum.text_en}
          my={curriculum.text_my}
          textarea
          onEn={(v) => setCurriculum({ ...curriculum, text_en: v })}
          onMy={(v) => setCurriculum({ ...curriculum, text_my: v })}
        />
        <PointsEditor
          label="Bullet points — English"
          points={curriculum.points_en}
          onChange={(pts) => setCurriculum({ ...curriculum, points_en: pts })}
        />
        <PointsEditor
          label="Bullet points — မြန်မာ"
          points={curriculum.points_my}
          onChange={(pts) => setCurriculum({ ...curriculum, points_my: pts })}
        />
      </Card>

      {/* Grade levels */}
      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">Grade Levels</p>
          <p className="text-xs text-slate-500">
            The level cards on the right side of the section.
          </p>
        </div>
        <LangRow
          label="Section title"
          en={levels.title_en}
          my={levels.title_my}
          onEn={(v) => setLevels({ ...levels, title_en: v })}
          onMy={(v) => setLevels({ ...levels, title_my: v })}
        />
        <div className="space-y-3">
          {levels.levels.map((level, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Level {i + 1}
                </p>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() =>
                    setLevels({
                      ...levels,
                      levels: levels.levels.filter((_, j) => j !== i),
                    })
                  }
                >
                  Remove
                </Button>
              </div>
              <LangRow
                label="Name"
                en={level.name_en}
                my={level.name_my}
                onEn={(v) => updateLevel(i, { name_en: v })}
                onMy={(v) => updateLevel(i, { name_my: v })}
              />
              <LangRow
                label="Age range"
                en={level.age_en}
                my={level.age_my}
                onEn={(v) => updateLevel(i, { age_en: v })}
                onMy={(v) => updateLevel(i, { age_my: v })}
              />
              <LangRow
                label="Description"
                en={level.desc_en}
                my={level.desc_my}
                textarea
                onEn={(v) => updateLevel(i, { desc_en: v })}
                onMy={(v) => updateLevel(i, { desc_my: v })}
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setLevels({
              ...levels,
              levels: [
                ...levels.levels,
                {
                  name_en: "",
                  name_my: "",
                  age_en: "",
                  age_my: "",
                  desc_en: "",
                  desc_my: "",
                },
              ],
            })
          }
        >
          + Add level
        </Button>
      </Card>

      {/* Beyond the classroom */}
      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">Beyond the Classroom</p>
          <p className="text-xs text-slate-500">
            The programmes section below the curriculum.
          </p>
        </div>
        <LangRow
          label="Section title"
          en={programs.title_en}
          my={programs.title_my}
          onEn={(v) => setPrograms({ ...programs, title_en: v })}
          onMy={(v) => setPrograms({ ...programs, title_my: v })}
        />
        <LangRow
          label="Subtitle"
          en={programs.subtitle_en}
          my={programs.subtitle_my}
          textarea
          onEn={(v) => setPrograms({ ...programs, subtitle_en: v })}
          onMy={(v) => setPrograms({ ...programs, subtitle_my: v })}
        />
        <div className="space-y-3">
          {programs.programs.map((program, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Programme {i + 1}
                </p>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() =>
                    setPrograms({
                      ...programs,
                      programs: programs.programs.filter((_, j) => j !== i),
                    })
                  }
                >
                  Remove
                </Button>
              </div>
              <LangRow
                label="Title"
                en={program.title_en}
                my={program.title_my}
                onEn={(v) => updateProgram(i, { title_en: v })}
                onMy={(v) => updateProgram(i, { title_my: v })}
              />
              <LangRow
                label="Description"
                en={program.desc_en}
                my={program.desc_my}
                textarea
                onEn={(v) => updateProgram(i, { desc_en: v })}
                onMy={(v) => updateProgram(i, { desc_my: v })}
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setPrograms({
              ...programs,
              programs: [
                ...programs.programs,
                { title_en: "", title_my: "", desc_en: "", desc_my: "" },
              ],
            })
          }
        >
          + Add programme
        </Button>
      </Card>

      <Button onClick={saveAll} disabled={busy}>
        {busy ? "Saving…" : "Save All Changes"}
      </Button>
    </div>
  );
}