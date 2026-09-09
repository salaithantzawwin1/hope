import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import RegisterPageContent from "@/components/RegisterPageContent";
import { REGISTRATION_EMAIL } from "@/lib/registration";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "register" });
  return { title: t("title") };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "register" });
  const steps = t.raw("steps") as { title: string; desc: string }[];

  return (
    <>
      {/* Header */}
      <section className="bg-brand-dark text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <h1 className="text-2xl font-bold sm:text-3xl">{t("title")}</h1>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-slate-200">
            {t("intro")}
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {t("stepsTitle")}
        </h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-base font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-bold leading-snug text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Form */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RegisterPageContent />
          </div>

          {/* Contact box */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-lg font-bold text-slate-900">
              {t("questionsTitle")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {t("questionsText")}
            </p>
            <a
              href={`mailto:${REGISTRATION_EMAIL}`}
              className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              {REGISTRATION_EMAIL}
            </a>
          </aside>
        </div>
      </section>
    </>
  );
}