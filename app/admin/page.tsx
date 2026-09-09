"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import AdminEvents from "@/components/admin/AdminEvents";
import AdminGallery from "@/components/admin/AdminGallery";
import AdminNews from "@/components/admin/AdminNews";
import AdminHome from "@/components/admin/AdminHome";
import AdminAbout from "@/components/admin/AdminAbout";
import AdminAcademics from "@/components/admin/AdminAcademics";
import AdminSiteContent from "@/components/admin/AdminSiteContent";
import AdminFooter from "@/components/admin/AdminFooter";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button, Notice } from "@/components/admin/ui";

type Tab =
  | "news"
  | "events"
  | "site"
  | "home"
  | "about"
  | "academics"
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
    ],
  },
  {
    id: "pages",
    label: "Pages",
    tabs: [
      { id: "home", label: "Home" },
      { id: "about", label: "About" },
      { id: "academics", label: "Academics" },
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

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    onSuccess();
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
            <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(getSupabase() !== null);
  const [tab, setTab] = useState<Tab>("news");

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let active = true;

    // Never leave the "Checking session…" screen hanging: if the session
    // check fails or takes too long (e.g. Supabase unreachable), fall
    // through to the login form instead of getting stuck forever.
    const check = Promise.race([
      supabase.auth.getSession(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Session check timed out")), 10000),
      ),
    ]);
    check
      .then(({ data }) => {
        if (active) setSession(data.session);
      })
      .catch(() => {
        // Treat any failure as signed-out; the login form is shown.
        if (active) setSession(null);
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!active) return;
        setSession(newSession);
        // A session event (including right after signing in) means the
        // check is done — never flip back to the checking screen.
        setChecking(false);
      },
    );

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const supabase = getSupabase();

  if (!supabase) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">Admin Portal</h1>
            <div className="mt-4 space-y-4">
              <Notice kind="info">
                <strong>Supabase is not configured yet.</strong> The admin
                portal activates once you add your project credentials.
              </Notice>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
                <li>Create a free project at supabase.com</li>
                <li>Run the SQL from <code className="rounded bg-slate-100 px-1">supabase/schema.sql</code> in the SQL editor</li>
                <li>Add users under Authentication → Users</li>
                <li>
                  Create <code className="rounded bg-slate-100 px-1">.env.local</code> with{" "}
                  <code className="rounded bg-slate-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                  <code className="rounded bg-slate-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                </li>
                <li>Rebuild the site (<code className="rounded bg-slate-100 px-1">npm run build</code>)</li>
              </ol>
              <p className="text-sm text-slate-500">
                Full instructions: README.md → “Supabase setup”.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Checking session…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center bg-slate-50 px-4 py-16">
        <LoginForm onSuccess={() => setChecking(false)} />
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
              <p className="text-xs text-slate-500">{session.user.email}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => supabase.auth.signOut()}
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
                        onClick={() => setTab(t.id)}
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
            {tab === "gallery" && <AdminGallery />}
            {tab === "header" && <AdminHeader />}
            {tab === "footer" && <AdminFooter />}
          </main>
        </div>
      </div>
    </div>
  );
}