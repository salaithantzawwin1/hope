"use client";

import { useEffect, useState } from "react";
import { apiSiteContent, contentApi } from "@/lib/api";
import {
  FALLBACK_HOME_CTA,
  FALLBACK_HOME_PROGRAMS,
  FALLBACK_HOME_STATS,
} from "@/lib/fallback-data";
import type {
  HomeCta,
  HomeProgram,
  HomePrograms,
  HomeStat,
  HomeStats,
} from "@/lib/types";
import { LangRow } from "./bilingual";
import { Button, Card, Notice, SubTabs } from "./ui";

const STATS_KEY = "home_stats";
const PROGRAMS_KEY = "home_programs";
const CTA_KEY = "home_cta";

function parseJson<T>(raw: string | undefined | null): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

type HomeSection = "stats" | "programs" | "cta";

const HOME_SECTIONS: { id: HomeSection; label: string }[] = [
  { id: "stats", label: "Hero Stats" },
  { id: "programs", label: "Programs" },
  { id: "cta", label: "CTA Banner" },
];

export default function AdminHome() {
  const [section, setSection] = useState<HomeSection>("stats");
  const [stats, setStats] = useState<HomeStats>(FALLBACK_HOME_STATS);
  const [programs, setPrograms] = useState<HomePrograms>(
    FALLBACK_HOME_PROGRAMS,
  );
  const [cta, setCta] = useState<HomeCta>(FALLBACK_HOME_CTA);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const rows = await apiSiteContent();
      if (!active) return;
      const map = new Map<string, string>(rows.map((r) => [r.key, r.value_en]));
      const s = parseJson<HomeStats>(map.get(STATS_KEY));
      const p = parseJson<HomePrograms>(map.get(PROGRAMS_KEY));
      const c = parseJson<HomeCta>(map.get(CTA_KEY));
      setStats(s ?? FALLBACK_HOME_STATS);
      setPrograms(p ?? FALLBACK_HOME_PROGRAMS);
      setCta(c ?? FALLBACK_HOME_CTA);
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
        { key: STATS_KEY, value_en: JSON.stringify(stats), value_my: JSON.stringify(stats) },
        { key: PROGRAMS_KEY, value_en: JSON.stringify(programs), value_my: JSON.stringify(programs) },
        { key: CTA_KEY, value_en: JSON.stringify(cta), value_my: JSON.stringify(cta) },
      ]);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const updateStat = (i: number, patch: Partial<HomeStat>) =>
    setStats({
      ...stats,
      stats: stats.stats.map((s, j) => (j === i ? { ...s, ...patch } : s)),
    });

  const updateProgram = (i: number, patch: Partial<HomeProgram>) =>
    setPrograms({
      ...programs,
      programs: programs.programs.map((p, j) => (j === i ? { ...p, ...patch } : p)),
    });

  if (!loaded) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      {error && <Notice kind="error">{error}</Notice>}
      {saved && <Notice kind="info">All changes saved ✓</Notice>}

      <p className="text-sm text-slate-500">
        These sections appear on the Home page. Leave the Burmese field empty
        to fall back to English. Save to publish immediately. The hero banner
        and welcome text are edited from the Site Text tab.
      </p>

      <SubTabs
        tabs={HOME_SECTIONS}
        active={section}
        onChange={(id) => setSection(id as HomeSection)}
      />

      {section === "stats" && (
      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">Hero Stats</p>
          <p className="text-xs text-slate-500">
            The numbered stats under the hero banner.
          </p>
        </div>
        <div className="space-y-3">
          {stats.stats.map((stat, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Stat {i + 1}
                </p>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() =>
                    setStats({
                      ...stats,
                      stats: stats.stats.filter((_, j) => j !== i),
                    })
                  }
                >
                  Remove
                </Button>
              </div>
              <LangRow
                label="Number"
                en={stat.number_en}
                my={stat.number_my}
                onEn={(v) => updateStat(i, { number_en: v })}
                onMy={(v) => updateStat(i, { number_my: v })}
              />
              <LangRow
                label="Label"
                en={stat.label_en}
                my={stat.label_my}
                onEn={(v) => updateStat(i, { label_en: v })}
                onMy={(v) => updateStat(i, { label_my: v })}
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setStats({
              ...stats,
              stats: [
                ...stats.stats,
                { number_en: "", number_my: "", label_en: "", label_my: "" },
              ],
            })
          }
        >
          + Add stat
        </Button>
      </Card>
      )}

      {section === "programs" && (
      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">Programs</p>
          <p className="text-xs text-slate-500">
            The &quot;Our Programs&quot; cards section.
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
                  Program {i + 1}
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
          + Add program
        </Button>
      </Card>
      )}

      {section === "cta" && (
      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">CTA Banner</p>
          <p className="text-xs text-slate-500">
            The &quot;Ready to join our community?&quot; banner at the bottom
            of the Home page.
          </p>
        </div>
        <LangRow
          label="Title"
          en={cta.title_en}
          my={cta.title_my}
          onEn={(v) => setCta({ ...cta, title_en: v })}
          onMy={(v) => setCta({ ...cta, title_my: v })}
        />
        <LangRow
          label="Text"
          en={cta.text_en}
          my={cta.text_my}
          textarea
          onEn={(v) => setCta({ ...cta, text_en: v })}
          onMy={(v) => setCta({ ...cta, text_my: v })}
        />
        <LangRow
          label="Primary button"
          en={cta.button_en}
          my={cta.button_my}
          onEn={(v) => setCta({ ...cta, button_en: v })}
          onMy={(v) => setCta({ ...cta, button_my: v })}
        />
        <LangRow
          label="Secondary button"
          en={cta.secondary_en}
          my={cta.secondary_my}
          onEn={(v) => setCta({ ...cta, secondary_en: v })}
          onMy={(v) => setCta({ ...cta, secondary_my: v })}
        />
      </Card>
      )}

      <Button onClick={saveAll} disabled={busy}>
        {busy ? "Saving…" : "Save All Changes"}
      </Button>
    </div>
  );
}