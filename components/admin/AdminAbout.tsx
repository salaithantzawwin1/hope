"use client";

import { useEffect, useState } from "react";
import { apiSiteContent, contentApi } from "@/lib/api";
import {
  FALLBACK_ABOUT_FACTS,
  FALLBACK_ABOUT_MISSION_VISION,
  FALLBACK_ABOUT_SECTIONS,
  FALLBACK_ABOUT_VALUES,
  FALLBACK_WHY_CHOOSE,
} from "@/lib/fallback-data";
import type {
  AboutCustomCard,
  AboutCustomSection,
  AboutFact,
  AboutFacts,
  AboutMissionVision,
  AboutValue,
  AboutValues,
  WhyChoose,
  WhyChooseItem,
} from "@/lib/types";
import { LangRow } from "./bilingual";
import { Button, Card, Field, Notice, SubTabs, TextInput } from "./ui";

const MISSION_VISION_KEY = "about_mission_vision";
const VALUES_KEY = "about_values";
const FACTS_KEY = "about_facts";
const SECTIONS_KEY = "about_sections";
const WHY_CHOOSE_KEY = "about_why_choose";

function parseJson<T>(raw: string | undefined | null): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

type AboutSection = "mission" | "why" | "values" | "sections" | "facts";

const ABOUT_SECTIONS: { id: AboutSection; label: string }[] = [
  { id: "mission", label: "Purpose & Direction" },
  { id: "why", label: "Why Choose Hope" },
  { id: "values", label: "Core Values" },
  { id: "sections", label: "Additional Sections" },
  { id: "facts", label: "School Facts" },
];

export default function AdminAbout() {
  const [section, setSection] = useState<AboutSection>("mission");
  const [missionVision, setMissionVision] = useState<AboutMissionVision>(
    FALLBACK_ABOUT_MISSION_VISION,
  );
  const [values, setValues] = useState<AboutValues>(FALLBACK_ABOUT_VALUES);
  const [facts, setFacts] = useState<AboutFacts>(FALLBACK_ABOUT_FACTS);
  const [sections, setSections] = useState<AboutCustomSection[]>(
    FALLBACK_ABOUT_SECTIONS,
  );
  const [whyChoose, setWhyChoose] = useState<WhyChoose>(FALLBACK_WHY_CHOOSE);
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
      const mv = parseJson<AboutMissionVision>(map.get(MISSION_VISION_KEY));
      const v = parseJson<AboutValues>(map.get(VALUES_KEY));
      const f = parseJson<AboutFacts>(map.get(FACTS_KEY));
      const s = parseJson<AboutCustomSection[]>(map.get(SECTIONS_KEY));
      const w = parseJson<WhyChoose>(map.get(WHY_CHOOSE_KEY));
      if (mv) {
        // Rows saved before extra_cards existed lack the field.
        mv.extra_cards ??= [];
      }
      setMissionVision(mv ?? FALLBACK_ABOUT_MISSION_VISION);
      setValues(v ?? FALLBACK_ABOUT_VALUES);
      setFacts(f ?? FALLBACK_ABOUT_FACTS);
      setSections(s ?? FALLBACK_ABOUT_SECTIONS);
      setWhyChoose(w ?? FALLBACK_WHY_CHOOSE);
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
        { key: MISSION_VISION_KEY, value_en: JSON.stringify(missionVision), value_my: JSON.stringify(missionVision) },
        { key: VALUES_KEY, value_en: JSON.stringify(values), value_my: JSON.stringify(values) },
        { key: FACTS_KEY, value_en: JSON.stringify(facts), value_my: JSON.stringify(facts) },
        { key: SECTIONS_KEY, value_en: JSON.stringify(sections), value_my: JSON.stringify(sections) },
        { key: WHY_CHOOSE_KEY, value_en: JSON.stringify(whyChoose), value_my: JSON.stringify(whyChoose) },
      ]);
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

  const updateSection = (i: number, patch: Partial<AboutCustomSection>) =>
    setSections(sections.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const updateSectionCard = (si: number, ci: number, patch: Partial<AboutCustomCard>) =>
    setSections(
      sections.map((s, j) =>
        j === si
          ? {
              ...s,
              cards: s.cards.map((c, k) => (k === ci ? { ...c, ...patch } : c)),
            }
          : s,
      ),
    );

  const updateExtraCard = (ci: number, patch: Partial<AboutCustomCard>) =>
    setMissionVision({
      ...missionVision,
      extra_cards: (missionVision.extra_cards ?? []).map((c, k) =>
        k === ci ? { ...c, ...patch } : c,
      ),
    });

  const updateWhyItem = (i: number, patch: Partial<WhyChooseItem>) =>
    setWhyChoose({
      ...whyChoose,
      items: whyChoose.items.map((item, j) => (j === i ? { ...item, ...patch } : item)),
    });

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

      <SubTabs
        tabs={ABOUT_SECTIONS}
        active={section}
        onChange={(id) => setSection(id as AboutSection)}
      />

      {section === "mission" && (
      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">Purpose &amp; Direction</p>
          <p className="text-xs text-slate-500">
            The cards at the top of the About page: Mission and Vision, plus
            any extra cards you add below. On desktop the grid widens to fit
            them — two cards side by side, three across, and up to four
            across once you add a fourth.
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

        <div className="space-y-3">
          {(missionVision.extra_cards ?? []).map((card, ci) => (
            <div
              key={ci}
              className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Extra card {ci + 1}
                </p>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() =>
                    setMissionVision({
                      ...missionVision,
                      extra_cards: (missionVision.extra_cards ?? []).filter(
                        (_, k) => k !== ci,
                      ),
                    })
                  }
                >
                  Remove
                </Button>
              </div>
              <Field label="Icon (emoji)" hint="Shown in a gradient tile — e.g. 🎓, 🤝, 🌱">
                <TextInput
                  value={card.icon}
                  onChange={(e) => updateExtraCard(ci, { icon: e.target.value })}
                  placeholder="✨"
                  className="max-w-40"
                />
              </Field>
              <LangRow
                label="Card title"
                en={card.title_en}
                my={card.title_my}
                onEn={(v) => updateExtraCard(ci, { title_en: v })}
                onMy={(v) => updateExtraCard(ci, { title_my: v })}
              />
              <LangRow
                label="Card text"
                en={card.text_en}
                my={card.text_my}
                textarea
                onEn={(v) => updateExtraCard(ci, { text_en: v })}
                onMy={(v) => updateExtraCard(ci, { text_my: v })}
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setMissionVision({
              ...missionVision,
              extra_cards: [
                ...(missionVision.extra_cards ?? []),
                { icon: "✨", title_en: "", title_my: "", text_en: "", text_my: "" },
              ],
            })
          }
        >
          + Add extra card
        </Button>
      </Card>
      )}

      {section === "why" && (
      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">Why Choose Hope</p>
          <p className="text-xs text-slate-500">
            The dark &quot;Why Choose Hope?&quot; band on the About page —
            icon + title + text items in a 3-column grid (2 on tablet, 1 on
            mobile).
          </p>
        </div>
        <LangRow
          label="Section title"
          en={whyChoose.title_en}
          my={whyChoose.title_my}
          onEn={(v) => setWhyChoose({ ...whyChoose, title_en: v })}
          onMy={(v) => setWhyChoose({ ...whyChoose, title_my: v })}
        />
        <div className="space-y-3">
          {whyChoose.items.map((item, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Item {i + 1}
                </p>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() =>
                    setWhyChoose({
                      ...whyChoose,
                      items: whyChoose.items.filter((_, j) => j !== i),
                    })
                  }
                >
                  Remove
                </Button>
              </div>
              <Field label="Icon (emoji)" hint="e.g. 🏫, 👩‍🏫, 🎓, ⚽, 🛡️, 🌟">
                <TextInput
                  value={item.icon}
                  onChange={(e) => updateWhyItem(i, { icon: e.target.value })}
                  placeholder="✨"
                  className="max-w-40"
                />
              </Field>
              <LangRow
                label="Title"
                en={item.title_en}
                my={item.title_my}
                onEn={(v) => updateWhyItem(i, { title_en: v })}
                onMy={(v) => updateWhyItem(i, { title_my: v })}
              />
              <LangRow
                label="Text"
                en={item.text_en}
                my={item.text_my}
                textarea
                onEn={(v) => updateWhyItem(i, { text_en: v })}
                onMy={(v) => updateWhyItem(i, { text_my: v })}
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setWhyChoose({
              ...whyChoose,
              items: [
                ...whyChoose.items,
                { icon: "✨", title_en: "", title_my: "", text_en: "", text_my: "" },
              ],
            })
          }
        >
          + Add item
        </Button>
      </Card>
      )}

      {section === "values" && (
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
      )}

      {section === "sections" && (
      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">Additional Sections</p>
          <p className="text-xs text-slate-500">
            Add more two-card sections to the About page (like Mission &amp;
            Vision) — e.g. Our History, Why Choose Us. They appear right
            below Mission &amp; Vision.
          </p>
        </div>

        {sections.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-xs text-slate-400">
            No additional sections yet — use &quot;+ Add section&quot; below.
          </p>
        )}

        {sections.map((section, si) => (
          <div key={si} className="space-y-4 rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Section {si + 1}
              </p>
              <Button
                type="button"
                variant="danger"
                onClick={() => setSections(sections.filter((_, j) => j !== si))}
              >
                Remove section
              </Button>
            </div>
            <LangRow
              label="Eyebrow (small label)"
              en={section.eyebrow_en}
              my={section.eyebrow_my}
              onEn={(v) => updateSection(si, { eyebrow_en: v })}
              onMy={(v) => updateSection(si, { eyebrow_my: v })}
            />
            <LangRow
              label="Section title"
              en={section.title_en}
              my={section.title_my}
              onEn={(v) => updateSection(si, { title_en: v })}
              onMy={(v) => updateSection(si, { title_my: v })}
            />

            <div className="space-y-3">
              {section.cards.map((card, ci) => (
                <div
                  key={ci}
                  className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Card {ci + 1}
                    </p>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() =>
                        updateSection(si, {
                          cards: section.cards.filter((_, k) => k !== ci),
                        })
                      }
                    >
                      Remove card
                    </Button>
                  </div>
                  <Field label="Icon (emoji)" hint="Shown in a gradient tile — e.g. 🏫, 📜, 🌍">
                    <TextInput
                      value={card.icon}
                      onChange={(e) => updateSectionCard(si, ci, { icon: e.target.value })}
                      placeholder="✨"
                      className="max-w-40"
                    />
                  </Field>
                  <LangRow
                    label="Card title"
                    en={card.title_en}
                    my={card.title_my}
                    onEn={(v) => updateSectionCard(si, ci, { title_en: v })}
                    onMy={(v) => updateSectionCard(si, ci, { title_my: v })}
                  />
                  <LangRow
                    label="Card text"
                    en={card.text_en}
                    my={card.text_my}
                    textarea
                    onEn={(v) => updateSectionCard(si, ci, { text_en: v })}
                    onMy={(v) => updateSectionCard(si, ci, { text_my: v })}
                  />
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                updateSection(si, {
                  cards: [
                    ...section.cards,
                    { icon: "✨", title_en: "", title_my: "", text_en: "", text_my: "" },
                  ],
                })
              }
            >
              + Add card
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setSections([
              ...sections,
              { eyebrow_en: "", eyebrow_my: "", title_en: "", title_my: "", cards: [] },
            ])
          }
        >
          + Add section
        </Button>
      </Card>
      )}

      {section === "facts" && (
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
      )}

      <Button onClick={saveAll} disabled={busy}>
        {busy ? "Saving…" : "Save All Changes"}
      </Button>
    </div>
  );
}