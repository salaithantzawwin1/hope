"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { FALLBACK_FOOTER } from "@/lib/fallback-data";
import type { FooterContent, FooterLink } from "@/lib/types";
import { LangRow } from "./bilingual";
import { Button, Card, Field, Notice, TextInput } from "./ui";

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
  const supabase = getSupabase();
  const [footer, setFooter] = useState<FooterContent>(FALLBACK_FOOTER);
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
        .select("value_en")
        .eq("key", FOOTER_KEY)
        .maybeSingle();
      if (!active) return;
      const parsed = parseJson<FooterContent>(data?.value_en);
      // Merge with defaults so older saved rows (e.g. without quick links)
      // still have sensible values for every field.
      if (parsed) setFooter({ ...FALLBACK_FOOTER, ...parsed });
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (!supabase) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const { error } = await supabase.from("site_content").upsert(
        {
          key: FOOTER_KEY,
          value_en: JSON.stringify(footer),
          value_my: JSON.stringify(footer),
        },
        { onConflict: "key" },
      );
      if (error) throw error;
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const update = (patch: Partial<FooterContent>) =>
    setFooter({ ...footer, ...patch });

  const updateLink = (i: number, patch: Partial<FooterLink>) =>
    setFooter({
      ...footer,
      links: footer.links.map((l, j) => (j === i ? { ...l, ...patch } : l)),
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

      {/* Quick links */}
      <Card className="space-y-4 p-5">
        <div>
          <p className="text-sm font-bold text-slate-900">Quick Links</p>
          <p className="text-xs text-slate-500">
            The footer navigation links (internal paths like &quot;/about&quot;).
            Rows without a URL or label are hidden on the site.
          </p>
        </div>
        <div className="space-y-3">
          {footer.links.map((link, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Link {i + 1}
                </p>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() =>
                    setFooter({
                      ...footer,
                      links: footer.links.filter((_, j) => j !== i),
                    })
                  }
                >
                  Remove
                </Button>
              </div>
              <Field label="URL (href)">
                <TextInput
                  value={link.href}
                  onChange={(e) => updateLink(i, { href: e.target.value })}
                  placeholder="/about"
                />
              </Field>
              <LangRow
                label="Label"
                en={link.label_en}
                my={link.label_my}
                onEn={(v) => updateLink(i, { label_en: v })}
                onMy={(v) => updateLink(i, { label_my: v })}
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setFooter({
              ...footer,
              links: [
                ...footer.links,
                { href: "", label_en: "", label_my: "" },
              ],
            })
          }
        >
          + Add link
        </Button>
      </Card>

      <Button onClick={save} disabled={busy}>
        {busy ? "Saving…" : "Save All Changes"}
      </Button>
    </div>
  );
}