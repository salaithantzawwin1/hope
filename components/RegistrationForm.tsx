"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { fetchEvents } from "@/lib/db";
import { errorId, invalidProps } from "@/lib/form-a11y";
import { localized, type EventItem } from "@/lib/types";
import type { RegistrationPayload } from "@/lib/registration";
import { submitToInbox } from "@/lib/submissions";
import { useRegisterEmail } from "./RegisterEditable";
import { useSettings } from "./useSettings";

type Errors = {
  parentName?: string;
  email?: string;
  phone?: string;
  program?: string;
};

/** Select value for "not an event" submissions. */
const GENERAL_OPTION = "__general";

export default function RegistrationForm() {
  const t = useTranslations("register");
  const f = (key: string) => t(`form.${key}`);
  const locale = useLocale();

  // Admin-editable address (Admin → Register → Questions box); the built-in
  // default applies until staff change it. Grade options come from the
  // Settings tab too.
  const contactEmail = useRegisterEmail();
  const settings = useSettings();
  const gradeLevels = settings.grade_levels;
  const [honeypot, setHoneypot] = useState("");

  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");
  const [program, setProgram] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [lockedEvent, setLockedEvent] = useState(false);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [errorKind, setErrorKind] = useState<
    "notConfigured" | "network" | "server" | null
  >(null);

  // Load upcoming events for the "Registering For" dropdown, then
  // preselect + lock the event when arriving from an event page
  // (e.g. /register?event=<event-id>; older links use the title).
  useEffect(() => {
    let active = true;
    fetchEvents().then((rows) => {
      if (!active) return;
      setEvents(rows);
      const ev = new URLSearchParams(window.location.search).get("event");
      if (!ev) return;
      const match =
        rows.find((e) => e.id === ev) ??
        rows.find(
          (e) => localized(e, locale, "title_en", "title_my") === ev,
        );
      if (match) {
        setProgram(match.id);
        setLockedEvent(true);
      }
    });
    return () => {
      active = false;
    };
  }, [locale]);

  // Success replaces the whole form, so a live region would mount already
  // filled in and go unannounced — move focus to the panel instead.
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const validate = (): Errors => {
    const next: Errors = {};
    if (!parentName.trim()) next.parentName = f("validationName");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = f("validationEmail");
    if (!phone.trim()) next.phone = f("validationPhone");
    if (!program) next.program = f("validationProgram");
    return next;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStatus("error");
      setErrorKind(null);
      return;
    }

    setStatus("sending");
    const selectedEvent = events.find((e) => e.id === program);
    const programLabel = selectedEvent
      ? localized(selectedEvent, locale, "title_en", "title_my")
      : program === GENERAL_OPTION
        ? f("general")
        : "";
    const payload: RegistrationPayload = {
      parentName: parentName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      studentName: studentName.trim(),
      grade,
      eventId: selectedEvent?.id ?? "",
      program: programLabel,
      notes: notes.trim(),
      locale,
      submittedAt: new Date().toISOString(),
    };
    // Preferred path: the Worker inbox (D1 + Apps Script mirror). Fallback:
    // the Apps Script directly (last resort stays the mailto error notice).
    const result = await submitToInbox("registration", { ...payload, website: honeypot }, settings.registration_endpoint);
    if (result.ok) {
      setStatus("success");
      setErrorKind(null);
    } else {
      setStatus("error");
      setErrorKind(result.error === "rate_limited" ? "server" : (result.error ?? "network"));
    }
  };

  const inputClass = (hasError?: string) =>
    `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
        : "border-slate-300 focus:border-brand focus:ring-brand/20"
    }`;

  if (status === "success") {
    return (
      <div
        ref={successRef}
        role="status"
        tabIndex={-1}
        className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm outline-none sm:p-12"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
          ✅
        </div>
        <h3 className="mt-4 text-xl font-bold text-slate-900">
          {f("successTitle")}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
          {f("successText")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-xl font-bold text-slate-900">{t("formTitle")}</h3>
      <p className="mt-1.5 text-sm text-slate-500">{t("formSubtitle")}</p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        {/* Honeypot — see InquiryForm. Bots that fill it are dropped silently. */}
        <div aria-hidden className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="reg-website">Website</label>
          <input
            id="reg-website"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="reg-parent-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              {f("parentName")} *
            </label>
            <input
              id="reg-parent-name"
              type="text"
              required
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder={f("parentNamePlaceholder")}
              className={inputClass(errors.parentName)}
              {...invalidProps("reg", "parentName", errors)}
            />
            {errors.parentName && (
              <p
                id={errorId("reg", "parentName")}
                className="mt-1 text-xs text-red-600"
              >
                {errors.parentName}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="reg-email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              {f("email")} *
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={f("emailPlaceholder")}
              className={inputClass(errors.email)}
              {...invalidProps("reg", "email", errors)}
            />
            {errors.email && (
              <p id={errorId("reg", "email")} className="mt-1 text-xs text-red-600">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="reg-phone"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              {f("phone")} *
            </label>
            <input
              id="reg-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={f("phonePlaceholder")}
              className={inputClass(errors.phone)}
              {...invalidProps("reg", "phone", errors)}
            />
            {errors.phone && (
              <p id={errorId("reg", "phone")} className="mt-1 text-xs text-red-600">
                {errors.phone}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="reg-student-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              {f("studentName")}
            </label>
            <input
              id="reg-student-name"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder={f("studentNamePlaceholder")}
              className={inputClass()}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="reg-grade"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              {f("grade")}
            </label>
            <select
              id="reg-grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className={inputClass()}
            >
              <option value="">—</option>
              {gradeLevels.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="reg-program"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              {f("program")} *
            </label>
            <select
              id="reg-program"
              required
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              disabled={lockedEvent}
              className={inputClass(errors.program)}
              {...invalidProps("reg", "program", errors)}
            >
              <option value="">{f("programPlaceholder")}</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {localized(event, locale, "title_en", "title_my")}
                </option>
              ))}
              <option value={GENERAL_OPTION}>{f("general")}</option>
            </select>
            {lockedEvent && (
              <p className="mt-1 text-xs text-slate-500">🔒 {f("lockedNote")}</p>
            )}
            {errors.program && (
              <p
                id={errorId("reg", "program")}
                className="mt-1 text-xs text-red-600"
              >
                {errors.program}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="reg-notes"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            {f("notes")}
          </label>
          <textarea
            id="reg-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={f("notesPlaceholder")}
            rows={4}
            className={inputClass()}
          />
        </div>

        {status === "error" && errorKind === "notConfigured" && (
          <div role="alert" className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p>{f("notConfigured")}</p>
            <a
              href={`mailto:${contactEmail}`}
              className="mt-1 inline-block font-semibold underline"
            >
              {contactEmail}
            </a>
          </div>
        )}
        {/* role="alert" implies aria-live="assertive", so the summary is read
            out as soon as validation fails or delivery breaks. */}
        {status === "error" && errorKind !== "notConfigured" && (
          <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            <p>
              <strong>{f("errorTitle")}</strong> — {f("errorText")}
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="mt-1 inline-block font-semibold underline"
            >
              {contactEmail}
            </a>
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