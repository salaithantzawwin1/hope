"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  APPLICATION_EMAIL,
  MAX_CV_BYTES,
  submitJobApplication,
  type JobApplicationResult,
} from "@/lib/job-application";

export type ApplyModalProps = {
  open: boolean;
  onClose: () => void;
  /** Titles of the open positions, already localized. */
  positions: string[];
  /** Preselected position title (when applying for a specific job). */
  initialPosition?: string;
};

type Errors = {
  name?: string;
  phone?: string;
  email?: string;
  position?: string;
  cv?: string;
};

const MAX_CV_LABEL = "10 MB";

export default function ApplyModal({
  open,
  onClose,
  positions,
  initialPosition,
}: ApplyModalProps) {
  const t = useTranslations("carrier.applyModal");
  const f = (
    key: string,
    values?: Record<string, string | number | Date>,
  ) => t(key, values);

  const dialogRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState(initialPosition ?? positions[0] ?? "");
  const [notes, setNotes] = useState("");
  const [cv, setCv] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [errorKind, setErrorKind] = useState<
    JobApplicationResult["error"] | null
  >(null);

  // Close on Escape; keep focus inside the dialog while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const validate = (): Errors => {
    const next: Errors = {};
    if (!name.trim()) next.name = f("validationName");
    if (!phone.trim()) next.phone = f("validationPhone");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = f("validationEmail");
    if (!position) next.position = f("validationPosition");
    if (!cv) next.cv = f("validationCv");
    return next;
  };

  const onFile = (file: File | null) => {
    setErrors((prev) => ({ ...prev, cv: undefined }));
    if (!file) {
      setCv(null);
      return;
    }
    if (file.size > MAX_CV_BYTES) {
      setCv(null);
      setErrors((prev) => ({ ...prev, cv: f("validationCvSize") }));
      return;
    }
    setCv(file);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("sending");
    const buf = await cv!.arrayBuffer();
    // Base64-encode the CV in binary-safe chunks.
    let binary = "";
    const bytes = new Uint8Array(buf);
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    const result = await submitJobApplication({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      position,
      notes: notes.trim(),
      cvFileName: cv!.name,
      cvMimeType: cv!.type || "application/octet-stream",
      cvBase64: btoa(binary),
      locale: document.documentElement.lang || "en",
      submittedAt: new Date().toISOString(),
    });
    if (result.ok) {
      setStatus("success");
      setErrorKind(null);
    } else {
      setStatus("error");
      setErrorKind(result.error ?? "network");
    }
  };

  const inputClass = (hasError?: string) =>
    `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
        : "border-slate-300 focus:border-brand focus:ring-brand/20"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={f("title")}
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl outline-none sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{f("title")}</h3>
            <p className="mt-1 text-sm text-slate-500">{f("subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={f("close")}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {status === "success" ? (
          <div className="mt-8 mb-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
              ✅
            </div>
            <h4 className="mt-4 text-lg font-bold text-slate-900">
              {f("successTitle")}
            </h4>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
              {f("successText")}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark"
            >
              {f("close")}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="apply-name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {f("name")} *
              </label>
              <input
                id="apply-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={f("namePlaceholder")}
                className={inputClass(errors.name)}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="apply-phone"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  {f("phone")} *
                </label>
                <input
                  id="apply-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={f("phonePlaceholder")}
                  className={inputClass(errors.phone)}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="apply-email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  {f("email")} *
                </label>
                <input
                  id="apply-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={f("emailPlaceholder")}
                  className={inputClass(errors.email)}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="apply-position"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {f("position")} *
              </label>
              <select
                id="apply-position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className={inputClass(errors.position)}
              >
                {positions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {errors.position && (
                <p className="mt-1 text-xs text-red-600">{errors.position}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="apply-notes"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {f("notes")}
              </label>
              <textarea
                id="apply-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={f("notesPlaceholder")}
                rows={3}
                className={inputClass()}
              />
            </div>

            <div>
              <label
                htmlFor="apply-cv"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {f("cv")} *
              </label>
              <input
                id="apply-cv"
                type="file"
                accept=".pdf,.doc,.docx,.rtf,image/*"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white text-sm text-slate-700 file:mr-3 file:cursor-pointer file:rounded-l-lg file:border-0 file:bg-brand/10 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-brand hover:file:bg-brand/20 focus:outline-none focus:ring-2 focus:border-brand focus:ring-brand/20"
              />
              <p className="mt-1.5 text-xs text-slate-400">
                {f("cvHint", { size: MAX_CV_LABEL })}
              </p>
              {cv && !errors.cv && (
                <p className="mt-1 text-xs text-slate-500">
                  {cv.name} ({Math.ceil(cv.size / 1024)} KB)
                </p>
              )}
              {errors.cv && (
                <p className="mt-1 text-xs text-red-600">{errors.cv}</p>
              )}
            </div>

            {status === "error" && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                <p>
                  <strong>{f("errorTitle")}</strong> — {f("errorText")}
                </p>
                <a
                  href={`mailto:${APPLICATION_EMAIL}?subject=${encodeURIComponent(
                    `Job application: ${position} — ${name}`,
                  )}`}
                  className="mt-1 inline-block font-semibold underline"
                >
                  {APPLICATION_EMAIL}
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {status === "sending" ? f("sending") : f("submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
