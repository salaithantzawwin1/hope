import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "academics" });
  return { title: t("title") };
}

export default async function AcademicsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "academics" });

  const curriculumPoints = t.raw("curriculumPoints") as string[];
  const levels = t.raw("levels") as { name: string; age: string; desc: string }[];
  const programs = t.raw("programs") as { title: string; desc: string }[];

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

      {/* Curriculum */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {t("curriculumTitle")}
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              {t("curriculumText")}
            </p>
            <ul className="mt-6 space-y-3">
              {curriculumPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs text-brand">
                    ✓
                  </span>
                  <span className="text-sm leading-relaxed text-slate-700">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {levels.map((level, i) => (
              <div
                key={level.name}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-lg font-bold text-brand">
                    {["🧸", "📖", "🔬", "🎓"][i]}
                  </span>
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-dark">
                    {level.age}
                  </span>
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{level.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {level.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beyond the classroom */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-900">
              {t("programsTitle")}
            </h2>
            <p className="mt-3 text-slate-500">{t("programsSubtitle")}</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {programs.map((program) => (
              <div
                key={program.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="text-lg font-bold text-slate-900">
                  {program.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {program.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-4 py-10 sm:px-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="text-xl font-bold sm:text-2xl">{t("ctaTitle")}</h2>
            <p className="mt-1.5 text-sm text-slate-200">{t("ctaText")}</p>
          </div>
          <Link
            href="/admissions"
            className="shrink-0 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-brand-dark shadow transition-colors hover:bg-accent-dark"
          >
            {t("ctaButton")}
          </Link>
        </div>
      </section>
    </>
  );
}