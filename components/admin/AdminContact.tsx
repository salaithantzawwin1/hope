"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { FALLBACK_CONTACT } from "@/lib/fallback-data";
import type { ContactContent, SocialLink } from "@/lib/types";
import { LangRow } from "./bilingual";
import { Button, Card, Field, Notice, Select, TextInput } from "./ui";

const CONTACT_KEY = "contact_content";

const SOCIAL_KINDS = [
  { value: "facebook", label: "Facebook" },
  { value: "telegram", label: "Telegram" },
  { value: "viber", label: "Viber" },
  { value: "custom", label: "Other / custom link" },
];

function parseJson<T>(raw: string | undefined | null): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function AdminContact() {
  const supabase = getSupabase();
  const [data, setData] = useState<ContactContent>(FALLBACK_CONTACT);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!supabase) return;
      const { data: row } = await supabase
        .from("site_content")
        .select("value_en")
        .eq("key", CONTACT_KEY)
        .maybeSingle();
      if (!active) return;
      const parsed = parseJson<ContactContent>(row?.value_en);
      // Merge with defaults so older saved rows still have every field.
      if (parsed) setData({ ...FALLBACK_CONTACT, ...parsed });
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
          key: CONTACT_KEY,
          value_en: JSON.stringify(data),
          value_my: JSON.stringify(data),
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

  const update = (patch: Partial<ContactContent>) =>
    setData((prev) => ({ ...prev, ...patch }));

  const updateSocial = (i: number, patch: Partial<SocialLink>) =>
    update({
      socials: (data.socials ?? []).map((s, j) =>
        j === i ? { ...s, ...patch } : s,
      ),
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
        Everything on the Contact page — headings, contact details, social
        links and the Google Map. Leave the Burmese field empty to fall back
        to English. Save to publish immediately.
      </p>

      {/* Hero */}
      <Card className="space-y-4 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
          Hero banner
        </p>
        <LangRow
          label="Title"
          en={data.hero_title_en}
          my={data.hero_title_my}
          onEn={(v) => update({ hero_title_en: v })}
          onMy={(v) => update({ hero_title_my: v })}
        />
        <LangRow
          label="Subtitle"
          en={data.hero_subtitle_en}
          my={data.hero_subtitle_my}
          textarea
          onEn={(v) => update({ hero_subtitle_en: v })}
          onMy={(v) => update({ hero_subtitle_my: v })}
        />
      </Card>

      {/* Contact info cards */}
      <Card className="space-y-4 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
          Contact details
        </p>
        <LangRow
          label="Address card title"
          en={data.address_title_en}
          my={data.address_title_my}
          onEn={(v) => update({ address_title_en: v })}
          onMy={(v) => update({ address_title_my: v })}
        />
        <LangRow
          label="Address"
          en={data.address_en}
          my={data.address_my}
          textarea
          onEn={(v) => update({ address_en: v })}
          onMy={(v) => update({ address_my: v })}
        />
        <div className="grid gap-3 lg:grid-cols-2">
          <LangRow
            label="Phone card title"
            en={data.phone_title_en}
            my={data.phone_title_my}
            onEn={(v) => update({ phone_title_en: v })}
            onMy={(v) => update({ phone_title_my: v })}
          />
          <LangRow
            label="Phone number"
            en={data.phone_en}
            my={data.phone_my}
            onEn={(v) => update({ phone_en: v })}
            onMy={(v) => update({ phone_my: v })}
          />
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <LangRow
            label="Email card title"
            en={data.email_title_en}
            my={data.email_title_my}
            onEn={(v) => update({ email_title_en: v })}
            onMy={(v) => update({ email_title_my: v })}
          />
          <LangRow
            label="Email address"
            en={data.email_en}
            my={data.email_my}
            onEn={(v) => update({ email_en: v })}
            onMy={(v) => update({ email_my: v })}
          />
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <LangRow
            label="Hours card title"
            en={data.hours_title_en}
            my={data.hours_title_my}
            onEn={(v) => update({ hours_title_en: v })}
            onMy={(v) => update({ hours_title_my: v })}
          />
          <LangRow
            label="Opening hours"
            en={data.hours_en}
            my={data.hours_my}
            onEn={(v) => update({ hours_en: v })}
            onMy={(v) => update({ hours_my: v })}
          />
        </div>
      </Card>

      {/* Social links */}
      <Card className="space-y-4 p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
            Social links (Facebook, Telegram, Viber, …)
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Each link shows its brand icon on the Contact page. Empty links
            are hidden.
          </p>
        </div>
        {(data.socials ?? []).map((social, i) => (
          <div key={i} className="space-y-3 rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500">Link {i + 1}</p>
              <Button
                type="button"
                variant="danger"
                onClick={() =>
                  update({ socials: (data.socials ?? []).filter((_, j) => j !== i) })
                }
              >
                Remove
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Channel (icon)">
                <Select
                  value={SOCIAL_KINDS.some((k) => k.value === social.kind) ? social.kind : "custom"}
                  onChange={(e) => updateSocial(i, { kind: e.target.value })}
                >
                  {SOCIAL_KINDS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="URL"
                hint={
                  social.kind === "viber"
                    ? "Use viber://chat?number=%2B959… (the %2B encodes the +)"
                    : "https://…"
                }
              >
                <TextInput
                  value={social.href}
                  onChange={(e) => updateSocial(i, { href: e.target.value })}
                  placeholder={
                    social.kind === "viber"
                      ? "viber://chat?number=%2B959944188288"
                      : social.kind === "telegram"
                        ? "https://t.me/yourchannel"
                        : "https://facebook.com/yourpage"
                  }
                />
              </Field>
            </div>
            <LangRow
              label="Label"
              en={social.label_en}
              my={social.label_my}
              onEn={(v) => updateSocial(i, { label_en: v })}
              onMy={(v) => updateSocial(i, { label_my: v })}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            update({
              socials: [
                ...(data.socials ?? []),
                { kind: "custom", href: "", label_en: "", label_my: "" },
              ],
            })
          }
        >
          + Add social link
        </Button>
      </Card>

      {/* Google Map */}
      <Card className="space-y-4 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
          Google Map
        </p>
        <Field
          label="Map embed URL"
          hint="In Google Maps: search your location → Share → Embed a map → copy the src URL inside the iframe code. Leave empty to hide the map."
        >
          <TextInput
            value={data.map_embed_url}
            onChange={(e) => update({ map_embed_url: e.target.value })}
            placeholder="https://www.google.com/maps?q=…&output=embed"
          />
        </Field>
        <LangRow
          label="Map section title"
          en={data.map_title_en}
          my={data.map_title_my}
          onEn={(v) => update({ map_title_en: v })}
          onMy={(v) => update({ map_title_my: v })}
        />
      </Card>

      <Button onClick={save} disabled={busy}>
        {busy ? "Saving…" : "Save All Changes"}
      </Button>
    </div>
  );
}
