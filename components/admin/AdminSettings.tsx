"use client";

import { useEffect, useState } from "react";
import { apiSiteContent, contentApi } from "@/lib/api";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  mergeSettings,
  type SiteSettings,
} from "@/lib/settings";
import { LangRow, PointsEditor } from "./bilingual";
import { Button, Card, Field, SaveStatus, SubTabs, TextInput } from "./ui";

type Section = "school" | "forms" | "grades";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "school", label: "School Name & Logo" },
  { id: "forms", label: "Form Emails & Endpoints" },
  { id: "grades", label: "Grade Levels" },
];

export default function AdminSettings() {
  const [section, setSection] = useState<Section>("school");
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const rows = await apiSiteContent();
      if (!active) return;
      const row = rows.find((r) => r.key === SETTINGS_KEY);
      if (row) setSettings(mergeSettings(parse(row.value_en)));
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
        key: SETTINGS_KEY,
        value_en: JSON.stringify(settings),
        value_my: JSON.stringify(settings),
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const set = (patch: Partial<SiteSettings>) =>
    setSettings((prev) => ({ ...prev, ...patch }));

  if (!loaded) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <SaveStatus error={error} saved={saved} />

      <p className="text-sm text-slate-500">
        Site-wide values used by every page and all three public forms. Fields
        left empty keep the built-in default — so clearing an email by accident
        never breaks a form. Save to publish immediately.
      </p>

      <SubTabs
        tabs={SECTIONS}
        active={section}
        onChange={(id) => setSection(id as Section)}
      />

      {section === "school" && (
        <Card className="space-y-4 p-5">
          <LangRow
            label="School name (header & footer wordmark)"
            en={settings.school_name_en}
            my={settings.school_name_my}
            onEn={(v) => set({ school_name_en: v })}
            onMy={(v) => set({ school_name_my: v })}
          />
          <LangRow
            label="Wordmark sub-label (the small caps line under the name)"
            en={settings.school_tagline_en}
            my={settings.school_tagline_my}
            onEn={(v) => set({ school_tagline_en: v })}
            onMy={(v) => set({ school_tagline_my: v })}
          />
          <Field
            label="Footer logo image URL"
            hint="Shown next to the brand in the footer. Leave empty to keep /Logo.jpg. Upload via Gallery or News first, then paste its URL."
          >
            <TextInput
              value={settings.footer_logo_url}
              onChange={(e) => set({ footer_logo_url: e.target.value })}
              placeholder="/Logo.jpg"
            />
          </Field>
        </Card>
      )}

      {section === "forms" && (
        <>
          <Card className="space-y-4 p-5">
            <div>
              <p className="text-sm font-bold text-slate-900">
                Recipient addresses
              </p>
              <p className="text-xs text-slate-500">
                Where each form tells visitors to write, and the address shown
                in the forms&apos; fallback/error notices. The Google Apps Script
                scripts have their own ADMIN_EMAIL — change it there too (see
                the README) so delivered mail follows.
              </p>
            </div>
            <Field label="Inquiry form email" hint="Admissions page form.">
              <TextInput
                type="email"
                value={settings.inquiry_email}
                onChange={(e) => set({ inquiry_email: e.target.value })}
              />
            </Field>
            <Field
              label="Registration email"
              hint="Register page contact box + form error notices."
            >
              <TextInput
                type="email"
                value={settings.registration_email}
                onChange={(e) => set({ registration_email: e.target.value })}
              />
            </Field>
            <Field
              label="Job application email"
              hint="Shown in the Apply popup's error notice."
            >
              <TextInput
                type="email"
                value={settings.application_email}
                onChange={(e) => set({ application_email: e.target.value })}
              />
            </Field>
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <p className="text-sm font-bold text-slate-900">
                Google Apps Script endpoints
              </p>
              <p className="text-xs text-slate-500">
                Submissions are stored in this site&apos;s own database (the
                Submissions tab) and mirrored to these scripts for the Sheet +
                email backup. Leave a field empty to skip that mirror. Only
                change these when you re-deploy a script (Deploy → Manage
                deployments → copy the new /exec URL).
              </p>
            </div>
            <Field label="Inquiry endpoint">
              <TextInput
                value={settings.inquiry_endpoint}
                onChange={(e) => set({ inquiry_endpoint: e.target.value })}
                placeholder="https://script.google.com/macros/s/…/exec"
              />
            </Field>
            <Field label="Registration endpoint">
              <TextInput
                value={settings.registration_endpoint}
                onChange={(e) => set({ registration_endpoint: e.target.value })}
                placeholder="https://script.google.com/macros/s/…/exec"
              />
            </Field>
            <Field label="Job application endpoint">
              <TextInput
                value={settings.application_endpoint}
                onChange={(e) => set({ application_endpoint: e.target.value })}
                placeholder="https://script.google.com/macros/s/…/exec"
              />
            </Field>
          </Card>
        </>
      )}

      {section === "grades" && (
        <Card className="space-y-2 p-5">
          <div>
            <p className="text-sm font-bold text-slate-900">Grade levels</p>
            <p className="text-xs text-slate-500">
              The options in the &quot;Grade Interested In&quot; and
              &quot;Grade / Level&quot; dropdowns on the Admissions and
              Register forms.
            </p>
          </div>
          <PointsEditor
            label="Options (in dropdown order)"
            points={settings.grade_levels}
            onChange={(grade_levels) => set({ grade_levels })}
            addLabel="+ Add grade level"
          />
        </Card>
      )}

      <Button onClick={save} disabled={busy}>
        {busy ? "Saving…" : "Save All Changes"}
      </Button>
    </div>
  );
}

/** Tolerant parse — a malformed/partial block simply falls back to defaults. */
function parse(raw: string | undefined): unknown {
  if (!raw || !raw.trim()) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}
