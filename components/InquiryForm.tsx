"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { GRADE_LEVELS } from "@/lib/db";
import { errorId, invalidProps } from "@/lib/form-a11y";
import { INQUIRY_EMAIL, submitInquiry } from "@/lib/inquiry";

type Errors = { name?: string; email?: string; message?: string };

/** The address the mailto fallback opens (kept in sync with lib/inquiry.ts). */
const FALLBACK_EMAIL = INQUIRY_EMAIL;

export default function InquiryForm() {
  const t = useTranslations("admissions");
  const locale = useLocale();
  const f = (key: string) => t(`form.${key}`);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [grade, setGrade] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  // The confirmation appears in place of nothing (the form stays put), so
  // focus it: a fresh live region is not reliably announced.
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const validate = (): Errors => {
    const next: Errors = {};
    if (!name.trim()) next.name = f("validationName");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = f("validationEmail");
    if (!message.trim()) next.message = f("validationMessage");
    return next;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      grade: grade.trim(),
      message: message.trim(),
      locale,
      submittedAt: new Date().toISOString(),
    };    // Preferred path: automatic delivery via the Apps Script emailer
    // (Sheet + email to INQUIRY_EMAIL). Fallback: open the visitor's mail
    // app with a pre-filled message.
    const result = await submitInquiry(payload);
    if (result.ok) {
      setStatus("success");
      setName("");
      setEmail("");
      setPhone("");
      setGrade("");
      setMessage("");
      return;
    }
    // notConfigured (Apps Script not deployed yet) or network/server error →
    // open the visitor's mail app as a dependable fallback.
    const subject = encodeURIComponent(
      `[Inquiry] ${payload.name} — ${payload.grade || "General"}`,
    );
    const body = encodeURIComponent(
      [
        "New inquiry from the Hope International School website:",
        "",
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        payload.phone ? `Phone: ${payload.phone}` : "",
        payload.grade ? `Grade interested in: ${payload.grade}` : "",
        "",
        "Message:",
        payload.message,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    window.location.href = `mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${body}`;
    setStatus("success");
  };

  const inputClass = (hasError?: string) =>
    `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
        : "border-slate-300 focus:border-brand focus:ring-brand/20"
    }`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-xl font-bold text-slate-900">{t("formTitle")}</h3>
      <p className="mt-1.5 text-sm text-slate-500">{t("formSubtitle")}</p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="inq-name" className="mb-1.5 block text-sm font-medium text-slate-700">
              {f("name")} *
            </label>
            <input
              id="inq-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={f("namePlaceholder")}
              className={inputClass(errors.name)}
              {...invalidProps("inq", "name", errors)}
            />
            {errors.name && (
              <p id={errorId("inq", "name")} className="mt-1 text-xs text-red-600">
                {errors.name}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="inq-email" className="mb-1.5 block text-sm font-medium text-slate-700">
              {f("email")} *
            </label>
            <input
              id="inq-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={f("emailPlaceholder")}
              className={inputClass(errors.email)}
              {...invalidProps("inq", "email", errors)}
            />
            {errors.email && (
              <p id={errorId("inq", "email")} className="mt-1 text-xs text-red-600">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="inq-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
              {f("phone")}
            </label>
            <input
              id="inq-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={f("phonePlaceholder")}
              className={inputClass()}
            />
          </div>
          <div>
            <label htmlFor="inq-grade" className="mb-1.5 block text-sm font-medium text-slate-700">
              {f("grade")}
            </label>
            <select
              id="inq-grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className={inputClass()}
            >
              <option value="">—</option>
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="inq-message" className="mb-1.5 block text-sm font-medium text-slate-700">
            {f("message")} *
          </label>
          <textarea
            id="inq-message"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={f("messagePlaceholder")}
            rows={5}
            className={inputClass(errors.message)}
            {...invalidProps("inq", "message", errors)}
          />
          {errors.message && (
            <p
              id={errorId("inq", "message")}
              className="mt-1 text-xs text-red-600"
            >
              {errors.message}
            </p>
          )}
        </div>

        {/* role="alert" = assertive live region: field problems and delivery
            failures are announced the moment they appear. */}
        {status === "error" && (
          <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            <strong>{f("errorTitle")}</strong> — {f("errorText")}
          </div>
        )}

        {status === "success" && (
          <div
            ref={successRef}
            role="status"
            tabIndex={-1}
            className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 outline-none"
          >
            <strong>{f("successTitle")}</strong> {f("successText")}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark disabled:opacity-60 sm:w-auto"
        >
          {status === "sending" ? f("sending") : f("submit")}
        </button>
      </form>
    </div>
  );
}