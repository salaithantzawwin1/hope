"use client";

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

const baseInput =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${baseInput} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${baseInput} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${baseInput} ${props.className ?? ""}`} />;
}

type Variant = "primary" | "secondary" | "danger";

export function Button({
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    primary:
      "bg-brand text-white hover:bg-brand-dark",
    secondary:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button
      {...props}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${styles[variant]} ${props.className ?? ""}`}
    />
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function SubTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; dot?: "green" | "gray" }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-100/70 p-1"
      role="tablist"
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all ${
            active === t.id
              ? "bg-white text-brand shadow-sm ring-1 ring-slate-900/5"
              : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            {t.dot && (
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  t.dot === "green" ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
            )}
            {t.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export function Notice({ kind, children }: { kind: "error" | "info"; children: React.ReactNode }) {
  const styles =
    kind === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-brand/20 bg-brand/5 text-brand";
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles}`}>{children}</div>
  );
}

/**
 * Bilingual save feedback shared by every admin section.
 *
 * Success → green confirmation (English + Burmese).
 * Failure → red alert (English + Burmese). Nothing in the form is cleared
 * until the API confirms, so on failure staff keep every edit and can
 * simply fix the problem and press Save again.
 */
export function SaveStatus({
  error,
  saved,
}: {
  error?: string | null;
  saved?: boolean;
}) {
  if (error) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        <p className="font-semibold">
          သိမ်းဆည်းမှု မအောင်မြင်ပါ — {error}
        </p>
        <p className="mt-1">Failed to save — {error}</p>
        <p className="mt-1 text-red-600">
          ဖောင်ကို မပိတ်ပါနဲ့ — ရေးထားသမျှ အချက်အလက်တွေ အားလုံး မပျက်မဆုံး ရှိနေပါတယ်။ ပြင်ဆင်ပြီး “Save” ကို ထပ်နှိပ်ပါ။
        </p>
      </div>
    );
  }
  if (!saved) return null;
  return (
    <div
      role="status"
      className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
    >
      All changes saved ✓ · အားလုံး သိမ်းဆည်းပြီးပါပြီ ✓
    </div>
  );
}