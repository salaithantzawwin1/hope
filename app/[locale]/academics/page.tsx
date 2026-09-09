import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AcademicsContent from "@/components/AcademicsContent";
import PageHeader from "@/components/PageHeader";
import SiteText from "@/components/SiteText";
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
      {/* Page header */}
      <PageHeader title={t("title")}>
        <SiteText
          k="academics_intro"
          en={t("intro")}
          my={t("intro")}
          as="p"
          className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200"
        />
      </PageHeader>

      {/* Curriculum + grade levels + beyond the classroom (editable) */}
      <AcademicsContent
        fallback={{
          curriculum: {
            title_en: t("curriculumTitle"),
            title_my: t("curriculumTitle"),
            text_en: t("curriculumText"),
            text_my: t("curriculumText"),
            points_en: curriculumPoints,
            points_my: curriculumPoints,
          },
          levels: {
            title_en: t("levelsTitle"),
            title_my: t("levelsTitle"),
            levels: levels.map((l) => ({
              name_en: l.name,
              name_my: l.name,
              age_en: l.age,
              age_my: l.age,
              desc_en: l.desc,
              desc_my: l.desc,
            })),
          },
          programs: {
            title_en: t("programsTitle"),
            title_my: t("programsTitle"),
            subtitle_en: t("programsSubtitle"),
            subtitle_my: t("programsSubtitle"),
            programs: programs.map((p) => ({
              title_en: p.title,
              title_my: p.title,
              desc_en: p.desc,
              desc_my: p.desc,
            })),
          },
        }}
      />

      {/* CTA */}
      <section className="bg-brand-light text-white">
        <div className="mx-auto flex max-w-7xl 2xl:max-w-[1440px] flex-col items-start justify-between gap-5 px-4 py-10 sm:px-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold sm:text-3xl">{t("ctaTitle")}</h2>
            <p className="mt-1.5 text-sm text-slate-100">{t("ctaText")}</p>
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