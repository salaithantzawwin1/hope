"use client";

import { useEffect, useState } from "react";
import { apiSiteContent, contentApi } from "@/lib/api";
import { FALLBACK_FOOTER } from "@/lib/fallback-data";
import type { FooterContent } from "@/lib/types";
import { LangRow } from "./bilingual";
import { Button, Card, Notice } from "./ui";

const FOOTER_KEY = "footer_content";

function parseJson<T>(raw: string | undefined | null): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function AdminFooter() {
  const [footer, setFooter] = useState<FooterContent>(FALLBACK_FOOTER);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const rows = await apiSiteContent();
      if (!active) return;
      const row = rows.find((r) => r.key === FOOTER_KEY);
      const parsed = parseJson<FooterContent>(row?.value_en);
      // Merge with defaults so older saved rows (e.g. without quick links)
      // still have sensible values for every field.
      if (parsed) setFooter({ ...FALLBACK_FOOTER, ...parsed });
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
        key: FOOTER_KEY,
        value_en: JSON.stringify(footer),
        value_my: JSON.stringify(footer),
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const update = (patch: Partial<FooterContent>) =>
    setFooter({ ...footer, ...patch });

  if (!loaded) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      {error && <Notice kind="error">{error}</Notice>}
      {saved && <Notice kind="info">All changes saved ✓</Notice>}

      <p className="text-sm text-slate-500">
        These details appear in the footer on every page. Leave the Burmese
        field empty to fall back to English. Save to publish immediately.
      </p>

      <Card className="space-y-4 p-5">
        <LangRow
          label="Tagline"
          en={footer.tagline_en}
          my={footer.tagline_my}
          textarea
          onEn={(v) => update({ tagline_en: v })}
          onMy={(v) => update({ tagline_my: v })}
        />
        <LangRow
          label="Address"
          en={footer.address_en}
          my={footer.address_my}
          textarea
          onEn={(v) => update({ address_en: v })}
          onMy={(v) => update({ address_my: v })}
        />
        <LangRow
          label="Phone"
          en={footer.phone_en}
          my={footer.phone_my}
          onEn={(v) => update({ phone_en: v })}
          onMy={(v) => update({ phone_my: v })}
        />
        <LangRow
          label="Email"
          en={footer.email_en}
          my={footer.email_my}
          onEn={(v) => update({ email_en: v })}
          onMy={(v) => update({ email_my: v })}
        />
        <LangRow
          label="Opening hours"
          en={footer.hours_en}
          my={footer.hours_my}
          onEn={(v) => update({ hours_en: v })}
          onMy={(v) => update({ hours_my: v })}
        />
      </Card>

      <Button onClick={save} disabled={busy}>
        {busy ? "Saving…" : "Save All Changes"}
      </Button>
    </div>
  );
}