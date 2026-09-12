"use client";

import { useEffect, useState } from "react";
import { apiSiteContent, contentApi } from "@/lib/api";
import { FALLBACK_HEADER } from "@/lib/fallback-data";
import type { HeaderContent } from "@/lib/types";
import { LinksEditor } from "./bilingual";
import { Button, Card, Field, SaveStatus, TextInput } from "./ui";

const HEADER_KEY = "header_content";

function parseJson<T>(raw: string | undefined | null): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function AdminHeader() {
  const [header, setHeader] = useState<HeaderContent>(FALLBACK_HEADER);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const rows = await apiSiteContent();
      if (!active) return;
      const row = rows.find((r) => r.key === HEADER_KEY);
      const parsed = parseJson<HeaderContent>(row?.value_en);
      // Merge with defaults so older saved rows still have every field.
      if (parsed) {
        // Merge links using fallback order as source of truth
        const dbLinkMap = new Map((parsed.links ?? []).map((l) => [l.href, l]));
        const mergedLinks = FALLBACK_HEADER.links.map((fl) => dbLinkMap.get(fl.href) ?? fl);
        setHeader({ ...FALLBACK_HEADER, ...parsed, links: mergedLinks });
      }
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
        key: HEADER_KEY,
        value_en: JSON.stringify(header),
        value_my: JSON.stringify(header),
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
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
        These appear in the header on every page. Leave a label empty to fall
        back to English. Rows without a URL or label are hidden on the site.
        The blue Admissions button is fixed and not listed here. Save to
        publish immediately.
      </p>

      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">Logo</p>
          <p className="text-xs text-slate-500">
            Image URL shown in the top-left corner. Leave empty to keep the
            built-in /Logo.jpg.
          </p>
        </div>
        <Field label="Logo image URL">
          <TextInput
            value={header.logo_url}
            onChange={(e) => setHeader({ ...header, logo_url: e.target.value })}
            placeholder="/Logo.jpg"
          />
        </Field>
      </Card>

      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">Nav Menu Items</p>
          <p className="text-xs text-slate-500">
            The links in the top navigation (internal paths like &quot;/about&quot;).
          </p>
        </div>
        <LinksEditor
          links={header.links}
          onChange={(links) => setHeader({ ...header, links })}
        />
      </Card>

      <Button onClick={save} disabled={busy}>
        {busy ? "Saving…" : "Save All Changes"}
      </Button>
    </div>
  );
}