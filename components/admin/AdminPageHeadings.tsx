"use client";

import { useEffect, useState } from "react";
import { apiSiteContent, contentApi } from "@/lib/api";
import type { PageHeadings } from "@/lib/types";
import { LangRow } from "./bilingual";
import { Button, Card, SaveStatus } from "./ui";

const KEY = "page_headings";

function parseJson<T>(raw: string | undefined | null): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const EMPTY: PageHeadings = {
  news_title_en: "",
  news_title_my: "",
  news_subtitle_en: "",
  news_subtitle_my: "",
  news_empty_en: "",
  news_empty_my: "",
  events_empty_en: "",
  events_empty_my: "",
  gallery_title_en: "",
  gallery_title_my: "",
  gallery_subtitle_en: "",
  gallery_subtitle_my: "",
  academics_cta_title_en: "",
  academics_cta_title_my: "",
  academics_cta_text_en: "",
  academics_cta_text_my: "",
  academics_cta_button_en: "",
  academics_cta_button_my: "",
  carrier_empty_en: "",
  carrier_empty_my: "",
};

export default function AdminPageHeadings() {
  const [data, setData] = useState<PageHeadings>(EMPTY);
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
      const parsed = parseJson<Partial<PageHeadings>>(row?.value_en);
      if (parsed) setData({ ...EMPTY, ...parsed });
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
        key: KEY,
        value_en: JSON.stringify(data),
        value_my: JSON.stringify(data),
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const set = (patch: Partial<PageHeadings>) =>
    setData((prev) => ({ ...prev, ...patch }));

  if (!loaded) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <SaveStatus error={error} saved={saved} />

      <p className="text-sm text-slate-500">
        Page titles, subtitles and &quot;nothing here yet&quot; messages.
        Leave any field empty to keep the built-in text. Save to publish
        immediately.
      </p>

      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">News &amp; Events page</p>
          <p className="text-xs text-slate-500">
            The dark banner at the top of the News &amp; Events page, and the
            messages shown when there is nothing to list yet.
          </p>
        </div>
        <LangRow
          label="Page title"
          en={data.news_title_en}
          my={data.news_title_my}
          onEn={(v) => set({ news_title_en: v })}
          onMy={(v) => set({ news_title_my: v })}
        />
        <LangRow
          label="Page subtitle"
          en={data.news_subtitle_en}
          my={data.news_subtitle_my}
          textarea
          onEn={(v) => set({ news_subtitle_en: v })}
          onMy={(v) => set({ news_subtitle_my: v })}
        />
        <LangRow
          label="Empty news message"
          en={data.news_empty_en}
          my={data.news_empty_my}
          onEn={(v) => set({ news_empty_en: v })}
          onMy={(v) => set({ news_empty_my: v })}
        />
        <LangRow
          label="Empty events message"
          en={data.events_empty_en}
          my={data.events_empty_my}
          onEn={(v) => set({ events_empty_en: v })}
          onMy={(v) => set({ events_empty_my: v })}
        />
      </Card>

      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">Gallery page</p>
        </div>
        <LangRow
          label="Page title"
          en={data.gallery_title_en}
          my={data.gallery_title_my}
          onEn={(v) => set({ gallery_title_en: v })}
          onMy={(v) => set({ gallery_title_my: v })}
        />
        <LangRow
          label="Page subtitle"
          en={data.gallery_subtitle_en}
          my={data.gallery_subtitle_my}
          textarea
          onEn={(v) => set({ gallery_subtitle_en: v })}
          onMy={(v) => set({ gallery_subtitle_my: v })}
        />
      </Card>

      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">
            Academics — bottom CTA band
          </p>
          <p className="text-xs text-slate-500">
            The blue banner at the bottom of the Academics page.
          </p>
        </div>
        <LangRow
          label="Title"
          en={data.academics_cta_title_en}
          my={data.academics_cta_title_my}
          onEn={(v) => set({ academics_cta_title_en: v })}
          onMy={(v) => set({ academics_cta_title_my: v })}
        />
        <LangRow
          label="Text"
          en={data.academics_cta_text_en}
          my={data.academics_cta_text_my}
          textarea
          onEn={(v) => set({ academics_cta_text_en: v })}
          onMy={(v) => set({ academics_cta_text_my: v })}
        />
        <LangRow
          label="Button label"
          en={data.academics_cta_button_en}
          my={data.academics_cta_button_my}
          onEn={(v) => set({ academics_cta_button_en: v })}
          onMy={(v) => set({ academics_cta_button_my: v })}
        />
      </Card>

      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">
            Carrier — &quot;no open positions&quot; note
          </p>
          <p className="text-xs text-slate-500">
            Shown on the Carrier page when every job is inactive.
          </p>
        </div>
        <LangRow
          label="Message"
          en={data.carrier_empty_en}
          my={data.carrier_empty_my}
          textarea
          onEn={(v) => set({ carrier_empty_en: v })}
          onMy={(v) => set({ carrier_empty_my: v })}
        />
      </Card>

      <Button onClick={save} disabled={busy}>
        {busy ? "Saving…" : "Save All Changes"}
      </Button>
    </div>
  );
}
