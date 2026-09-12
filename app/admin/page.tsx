"use client";

import { useEffect, useState, type FormEvent } from "react";
import { checkAuth, login, logout } from "@/lib/api";
import AdminEvents from "@/components/admin/AdminEvents";
import AdminAdmissions from "@/components/admin/AdminAdmissions";
import AdminGallery from "@/components/admin/AdminGallery";
import AdminNews from "@/components/admin/AdminNews";
import AdminHome from "@/components/admin/AdminHome";
import AdminAbout from "@/components/admin/AdminAbout";
import AdminAcademics from "@/components/admin/AdminAcademics";
import AdminSiteContent from "@/components/admin/AdminSiteContent";
import AdminFooter from "@/components/admin/AdminFooter";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminCarrier from "@/components/admin/AdminCarrier";
import AdminContact from "@/components/admin/AdminContact";
import { Button, Notice } from "@/components/admin/ui";

type Tab =
  | "news"
  | "events"
  | "site"
  | "admissions"
  | "home"
  | "about"
  | "academics"
  | "carrier"
  | "contact"
  | "gallery"
  | "header"
  | "footer";

type Group = "content" | "pages" | "settings";

const GROUPS: {
  id: Group;
  label: string;
  tabs: { id: Tab; label: string }[];
}[] = [
  {
    id: "content",
    label: "Content",
    tabs: [
      { id: "news", label: "News" },
      { id: "events", label: "Events" },
      { id: "gallery", label: "Gallery" },
      { id: "carrier", label: "Carrier" },
      { id: "contact", label: "Contact" },
    ],
  },
  {
    id: "pages",
    label: "Pages",
    tabs: [
      { id: "home", label: "Home" },
      { id: "about", label: "About" },
      { id: "academics", label: "Academics" },
      { id: "admissions", label: "Admissions" },
      { id: "site", label: "Site Text" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    tabs: [
      { id: "header", label: "Header" },
      { id: "footer", label: "Footer" },
    ],
  },
];

const TAB_IDS = new Set(GROUPS.flatMap((g) => g.tabs.map((t) => t.id)));

/**
 * Reads the active section from the URL hash (#gallery, #about, …) so a
 * browser refresh lands back where the user was instead of resetting to
 * News. Falls back to the News section for unknown/absent hashes. The
 * window access is deferred so the static prerender never touches it.
 */
function tabFromHash(): Tab {
  if (typeof window === "undefined") return "news";
  const id = window.location.hash.replace(/^#/, "") as Tab;
  return TAB_IDS.has(id) ? id : "news";
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [passphrase, setPassphrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(passphrase);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign-in failed — is the Worker's STAFF_PASSPHRASE secret configured?",
      );
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white">
            H
          </span>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Admin Portal
            </h1>
            <p className="text-xs text-slate-500">
              Hope International School
            </p>
          </div>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="admin-passphrase" className="mb-1.5 block text-sm font-medium text-slate-700">
              Staff passphrase
            </label>
            <input
              id="admin-passphrase"
              type="password"
              required
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          {error && <Notice kind="error">{error}</Notice>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>(tabFromHash);

  /** Switch sections and mirror the choice into the URL hash. */
  const selectTab = (id: Tab) => {
    setTab(id);
    // replaceState (not pushState): section switches stay out of the back
    // button's history; the hash is only a bookmark for refreshes.
    history.replaceState(
      null,
      "",
      id === "news" ? window.location.pathname : `#${id}`,
    );
  };

  // Follow manual hash edits (e.g. a bookmarked #contact link opened in
  // this same tab).
  useEffect(() => {
    const sync = () => setTab(tabFromHash());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    let active = true;
    // Never leave the "Checking session…" screen hanging: treat any failure
    // as signed-out so the login form is shown.
    checkAuth()
      .then((ok) => {
        if (active) setAuthed(ok);
      })
      .catch(() => {
        if (active) setAuthed(false);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Checking session…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center bg-slate-50 px-4 py-16">
        <LoginForm onSuccess={() => setAuthed(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-base font-bold text-white">
              H
            </span>
            <div>
              <h1 className="text-base font-bold text-slate-900">Admin Portal</h1>
              <p className="text-xs text-slate-500">Signed in with the staff passphrase</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              void logout();
              setAuthed(false);
            }}
          >
            Sign Out
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
          {/* Left sidebar navigation: a full-width scrollable strip on
              mobile, a sticky vertical menu on desktop. */}
          <nav className="w-full shrink-0 lg:sticky lg:top-8 lg:w-52 lg:self-start">
            <div className="flex gap-8 overflow-x-auto pb-2 lg:flex-col lg:gap-6 lg:overflow-visible lg:pb-0">
              {GROUPS.map((group) => (
                <div key={group.id} className="shrink-0">
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                    {group.label}
                  </p>
                  <div className="flex gap-1 lg:flex-col">
                    {group.tabs.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => selectTab(t.id)}
                        className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
                          tab === t.id
                            ? "bg-brand text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          <main className="min-w-0 flex-1">
            {tab === "news" && <AdminNews />}
            {tab === "events" && <AdminEvents />}
            {tab === "site" && <AdminSiteContent />}
            {tab === "home" && <AdminHome />}
            {tab === "about" && <AdminAbout />}
            {tab === "academics" && <AdminAcademics />}
            {tab === "admissions" && <AdminAdmissions />}
            {tab === "gallery" && <AdminGallery />}
            {tab === "carrier" && <AdminCarrier />}
            {tab === "contact" && <AdminContact />}
            {tab === "header" && <AdminHeader />}
            {tab === "footer" && <AdminFooter />}
          </main>
        </div>
      </div>
    </div>
  );
}