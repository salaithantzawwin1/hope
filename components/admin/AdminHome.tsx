"use client";

import { useEffect, useState } from "react";
import { apiSiteContent, contentApi } from "@/lib/api";
import {
  FALLBACK_HOME_CTA,
  FALLBACK_HOME_HERO,
  FALLBACK_HOME_PROGRAMS,
  FALLBACK_HOME_STATS,
} from "@/lib/fallback-data";
import { uploadImage } from "@/lib/upload";
import type {
  HomeCta,
  HomeHero,
  HomeHeroButton,
  HomeProgram,
  HomePrograms,
  HomeStat,
  HomeStats,
} from "@/lib/types";
import { LangRow } from "./bilingual";
import { Button, Card, Field, SaveStatus, SubTabs, TextInput } from "./ui";

const STATS_KEY = "home_stats";
const PROGRAMS_KEY = "home_programs";
const CTA_KEY = "home_cta";
const HERO_KEY = "home_hero";

function parseJson<T>(raw: string | undefined | null): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

type HomeSection = "hero" | "stats" | "programs" | "cta";

const HOME_SECTIONS: { id: HomeSection; label: string }[] = [
  { id: "hero", label: "Hero (Title, Buttons & Images)" },
  { id: "stats", label: "Hero Stats" },
  { id: "programs", label: "Programs" },
  { id: "cta", label: "CTA Banner" },
];

export default function AdminHome() {
  const [section, setSection] = useState<HomeSection>("hero");
  const [hero, setHero] = useState<HomeHero>(FALLBACK_HOME_HERO);
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
      const h = parseJson<HomeHero>(map.get(HERO_KEY));
      const s = parseJson<HomeStats>(map.get(STATS_KEY));
      const p = parseJson<HomePrograms>(map.get(PROGRAMS_KEY));
      const c = parseJson<HomeCta>(map.get(CTA_KEY));
      setHero({ ...FALLBACK_HOME_HERO, ...(h ?? {}) });
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
        { key: HERO_KEY, value_en: JSON.stringify(hero), value_my: JSON.stringify(hero) },
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

  const updateHeroButton = (i: number, patch: Partial<HomeHeroButton>) =>
    setHero({
      ...hero,
      buttons: hero.buttons.map((b, j) => (j === i ? { ...b, ...patch } : b)),
    });

  const moveHeroButton = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= hero.buttons.length) return;
    const buttons = [...hero.buttons];
    [buttons[i], buttons[j]] = [buttons[j], buttons[i]];
    setHero({ ...hero, buttons });
  };

  /** Upload one image for a hero/welcome slot and store its URL. */
  const uploadHeroImage = async (
    slot: "hero_image_url" | "welcome_image_url",
    file: File,
  ) => {
    setBusy(true);
    setError("");
    try {
      const url = await uploadImage(file, "site");
      setHero((h) => ({ ...h, [slot]: url }));
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  if (!loaded) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <SaveStatus error={error} saved={saved} />

      <p className="text-sm text-slate-500">
        These sections appear on the Home page. Leave the Burmese field empty
        to fall back to English. Save to publish immediately.
      </p>

      <SubTabs
        tabs={HOME_SECTIONS}
        active={section}
        onChange={(id) => setSection(id as HomeSection)}
      />

      {section === "hero" && (
        <Card className="space-y-5 p-5">
          <div>
            <p className="text-sm font-bold text-slate-900">Hero Banner</p>
            <p className="text-xs text-slate-500">
              The badge, title, subtitle, buttons and pictures at the top of
              the Home page.
            </p>
          </div>

          <LangRow
            label="Badge (small text above the title)"
            en={hero.badge_en ?? ""}
            my={hero.badge_my ?? ""}
            onEn={(v) => setHero({ ...hero, badge_en: v })}
            onMy={(v) => setHero({ ...hero, badge_my: v })}
          />
          <LangRow
            label="Hero title"
            en={hero.title_en ?? ""}
            my={hero.title_my ?? ""}
            onEn={(v) => setHero({ ...hero, title_en: v })}
            onMy={(v) => setHero({ ...hero, title_my: v })}
          />
          <LangRow
            label="Hero subtitle"
            en={hero.subtitle_en ?? ""}
            my={hero.subtitle_my ?? ""}
            textarea
            onEn={(v) => setHero({ ...hero, subtitle_en: v })}
            onMy={(v) => setHero({ ...hero, subtitle_my: v })}
          />

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Buttons under the hero text
            </p>
            <div className="mt-3 space-y-3">
              {hero.buttons.map((button, i) => (
                <div key={i} className="space-y-3 rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Button {i + 1}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={i === 0}
                        onClick={() => moveHeroButton(i, -1)}
                        title="Move up"
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={i === hero.buttons.length - 1}
                        onClick={() => moveHeroButton(i, 1)}
                        title="Move down"
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() =>
                          setHero({
                            ...hero,
                            buttons: hero.buttons.filter((_, j) => j !== i),
                          })
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <LangRow
                    label="Label"
                    en={button.label_en}
                    my={button.label_my}
                    onEn={(v) => updateHeroButton(i, { label_en: v })}
                    onMy={(v) => updateHeroButton(i, { label_my: v })}
                  />
                  <Field label="Link (URL)">
                    <TextInput
                      value={button.href}
                      onChange={(e) => updateHeroButton(i, { href: e.target.value })}
                      placeholder="/admissions"
                    />
                  </Field>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              className="mt-2"
              onClick={() =>
                setHero({
                  ...hero,
                  buttons: [
                    ...hero.buttons,
                    { label_en: "", label_my: "", href: "/admissions" },
                  ],
                })
              }
            >
              + Add button
            </Button>
          </div>

          <HeroImageField
            label="Hero background image"
            hint="The wide picture behind the hero title."
            url={hero.hero_image_url}
            onClear={() => setHero({ ...hero, hero_image_url: "" })}
            onPickFile={(file) => uploadHeroImage("hero_image_url", file)}
            busy={busy}
          />
          <HeroImageField
            label="Welcome section image"
            hint="The photo next to the welcome text."
            url={hero.welcome_image_url}
            onClear={() => setHero({ ...hero, welcome_image_url: "" })}
            onPickFile={(file) => uploadHeroImage("welcome_image_url", file)}
            busy={busy}
          />
        </Card>
      )}

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
/**
 * Upload / preview / remove control for one Home image slot. The uploaded
 * URL is only stored in the form state — it becomes public after
 * "Save All Changes" (consistent with every other section).
 */
function HeroImageField({
  label,
  hint,
  url,
  onClear,
  onPickFile,
  busy,
}: {
  label: string;
  hint: string;
  url: string;
  onClear: () => void;
  onPickFile: (file: File) => void;
  busy: boolean;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 p-4">
      <p className="text-sm font-bold text-slate-900">{label}</p>
      <p className="text-xs text-slate-500">{hint}</p>
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url || "/Bunner/01.jpg"}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label
            className={`cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 ${
              busy ? "pointer-events-none opacity-50" : ""
            }`}
          >
            {url ? "Replace image" : "Upload image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPickFile(file);
                e.target.value = "";
              }}
            />
          </label>
          {url && (
            <>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                View
              </a>
              <Button type="button" variant="danger" onClick={onClear}>
                Remove
              </Button>
            </>
          )}
        </div>
      </div>
      {!url && (
        <p className="text-xs text-slate-400">
          No custom image — the built-in default is shown.
        </p>
      )}
    </div>
  );
}
