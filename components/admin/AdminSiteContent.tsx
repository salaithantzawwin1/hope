"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { FALLBACK_SITE_CONTENT } from "@/lib/fallback-data";
import { Button, Card, Field, Notice, SubTabs, TextArea } from "./ui";

const LABELS: Record<string, string> = {
  home_hero_badge: "Home — hero badge",
  home_hero_title: "Home — hero title",
  home_hero_subtitle: "Home — hero subtitle",
  home_welcome_title: "Home — welcome title",
  home_welcome_text: "Home — welcome text",
  about_intro: "About — intro paragraph",
  academics_intro: "Academics — intro paragraph",
};

interface Row {
  key: string;
  value_en: string;
  value_my: string;
}

type SiteGroup = "home" | "about" | "academics";

const SITE_GROUPS: { id: SiteGroup; label: string; prefix: string }[] = [
  { id: "home", label: "Home", prefix: "home_" },
  { id: "about", label: "About", prefix: "about_" },
  { id: "academics", label: "Academics", prefix: "academics_" },
];

export default function AdminSiteContent() {
  const [group, setGroup] = useState<SiteGroup>("home");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const supabase = getSupabase();

  const load = async (): Promise<Row[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from("site_content").select("*");
    const dbRows = new Map<string, Row>((data ?? []).map((r) => [r.key, r]));
    const merged: Row[] = Object.keys(FALLBACK_SITE_CONTENT).map((key) => {
      const db = dbRows.get(key);
      return db
        ? { key, value_en: db.value_en, value_my: db.value_my }
        : {
            key,
            value_en: FALLBACK_SITE_CONTENT[key].en,
            value_my: FALLBACK_SITE_CONTENT[key].my,
          };
    });
    if (error) return [];
    return merged;
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const rows = await load();
      if (active) setRows(rows);
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
    setSavedKey(null);
    try {
      for (const row of rows) {
        const { error } = await supabase.from("site_content").upsert(
          { key: row.key, value_en: row.value_en, value_my: row.value_my },
          { onConflict: "key" },
        );
        if (error) throw error;
      }
      setSavedKey("All changes saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  if (!supabase) return null;

  return (
    <div className="space-y-6">
      {error && <Notice kind="error">{error}</Notice>}
      {savedKey && <Notice kind="info">{savedKey} ✓</Notice>}

      <p className="text-sm text-slate-500">
        These texts appear on the public site. Leave the Burmese field empty to
        fall back to English. Save to publish immediately.
      </p>

      <SubTabs
        tabs={SITE_GROUPS.map(({ id, label }) => ({ id, label }))}
        active={group}
        onChange={(id) => setGroup(id as SiteGroup)}
      />

      <div className="space-y-4">
        {rows
          .filter((r) => r.key.startsWith(SITE_GROUPS.find((g) => g.id === group)?.prefix ?? ""))
          .map((row) => (
          <Card key={row.key} className="space-y-3 p-5">
            <p className="text-sm font-bold text-slate-900">
              {LABELS[row.key] ?? row.key}
            </p>
            <div className="grid gap-3 lg:grid-cols-2">
              <Field label="English">
                <TextArea
                  rows={3}
                  value={row.value_en}
                  onChange={(e) =>
                    setRows(
                      rows.map((r) =>
                        r.key === row.key ? { ...r, value_en: e.target.value } : r,
                      ),
                    )
                  }
                />
              </Field>
              <Field label="မြန်မာ">
                <TextArea
                  rows={3}
                  value={row.value_my}
                  onChange={(e) =>
                    setRows(
                      rows.map((r) =>
                        r.key === row.key ? { ...r, value_my: e.target.value } : r,
                      ),
                    )
                  }
                />
              </Field>
            </div>
          </Card>
          ))}
      </div>

      <Button onClick={saveAll} disabled={busy}>
        {busy ? "Saving…" : "Save All Changes"}
      </Button>
    </div>
  );
}