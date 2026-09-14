"use client";

import { useEffect, useMemo, useState } from "react";
import {
  cvDownloadUrl,
  submissionsApi,
  type Submission,
} from "@/lib/submissions-api";
import { Button, Card, SaveStatus, SubTabs, TextInput } from "./ui";

type KindFilter = "all" | Submission["kind"];

const KIND_FILTERS: { id: KindFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "inquiry", label: "Inquiries" },
  { id: "registration", label: "Registrations" },
  { id: "application", label: "Applications" },
];

const KIND_LABEL: Record<Submission["kind"], string> = {
  inquiry: "Inquiry",
  registration: "Registration",
  application: "Application",
};

/** Field labels for the flat payload keys, best-effort. */
const FIELD_LABEL: Record<string, string> = {
  name: "Name",
  parentName: "Parent / Guardian",
  studentName: "Student",
  email: "Email",
  phone: "Phone",
  grade: "Grade",
  message: "Message",
  notes: "Notes",
  program: "Registering for",
  eventId: "Event ID",
  position: "Position",
  cvFileName: "CV file",
  locale: "Language",
  submittedAt: "Submitted at",
  website: "Website",
};

function fieldLabel(key: string): string {
  return FIELD_LABEL[key] ?? key;
}

/** Hide internal keys from the detail list. */
const HIDDEN_FIELDS = new Set(["website"]);

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminSubmissions() {
  const [kind, setKind] = useState<KindFilter>("all");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Submission[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async (): Promise<Submission[]> => {
    try {
      return await submissionsApi.list();
    } catch {
      return [];
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const rows = await load();
      if (active) setItems(rows);
    })();
    return () => {
      active = false;
    };
  }, []);

  const remove = async (item: Submission) => {
    if (!window.confirm("Delete this submission? This cannot be undone.")) return;
    setBusyId(item.id);
    try {
      await submissionsApi.remove(item.id);
      setItems((prev) => (prev ? prev.filter((i) => i.id !== item.id) : prev));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => {
    const list = items ?? [];
    return {
      all: list.length,
      inquiry: list.filter((i) => i.kind === "inquiry").length,
      registration: list.filter((i) => i.kind === "registration").length,
      application: list.filter((i) => i.kind === "application").length,
    } as Record<KindFilter, number>;
  }, [items]);

  const visible = useMemo(() => {
    const list = items ?? [];
    const filtered =
      kind === "all" ? list : list.filter((i) => i.kind === kind);
    const q = search.trim().toLowerCase();
    if (!q) return filtered;
    return filtered.filter((i) =>
      JSON.stringify(i.data).toLowerCase().includes(q),
    );
  }, [items, kind, search]);

  const tabs = KIND_FILTERS.map(({ id, label }) => ({
    id,
    label: `${label} (${counts[id] ?? 0})`,
  }));

  return (
    <div className="space-y-6">
      <SaveStatus error={error} />

      <p className="text-sm text-slate-500">
        Every inquiry, event registration and job application submitted on the
        public site lands here (the Google Sheet + email copies continue as
        before). Entries are read-only except for deleting spam.
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <SubTabs
            tabs={tabs}
            active={kind}
            onChange={(id) => setKind(id as KindFilter)}
          />
        </div>
        <div className="w-full sm:w-64">
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all fields…"
          />
        </div>
      </div>

      {items === null ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">
          No submissions here yet.
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((item) => {
            const open = openId === item.id;
            const fields = Object.entries(item.data).filter(
              ([key]) => !HIDDEN_FIELDS.has(key),
            );
            return (
              <Card key={item.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setOpenId(open ? null : item.id)}
                  >
                    <p className="truncate font-semibold text-slate-900">
                      {String(item.data.name ?? item.data.parentName ?? "(no name)")}
                      <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                        {KIND_LABEL[item.kind]}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatWhen(item.created_at)}
                      {item.data.email ? ` · ${String(item.data.email)}` : ""}
                      {item.data.position ? ` · ${String(item.data.position)}` : ""}
                      {item.data.program ? ` · ${String(item.data.program)}` : ""}
                    </p>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    {item.kind === "application" && (
                      <a
                        href={cvDownloadUrl(item.id)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        Download CV
                      </a>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => setOpenId(open ? null : item.id)}
                    >
                      {open ? "Hide" : "View"}
                    </Button>
                    <Button
                      variant="danger"
                      disabled={busyId === item.id}
                      onClick={() => remove(item)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {open && (
                  <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                    {fields.map(([key, value]) => (
                      <div key={key} className="grid gap-1 sm:grid-cols-[180px_1fr]">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {fieldLabel(key)}
                        </dt>
                        <dd className="whitespace-pre-line break-words text-slate-700">
                          {key === "cvFileName" ? String(value ?? "") : String(value ?? "")}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
