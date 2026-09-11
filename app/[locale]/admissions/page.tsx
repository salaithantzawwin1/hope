import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import InquiryForm from "@/components/InquiryForm";
import PageHeader from "@/components/PageHeader";
import { AdmissionsIntro, AdmissionsSections } from "@/components/AdmissionsEditable";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admissions" });
  return { title: t("title") };
}

export default async function AdmissionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admissions" });

  return (
    <>
      {/* Page header */}
      <PageHeader title={t("title")}>
        <AdmissionsIntro
          fallback={{
            intro_en: t("intro"),
            intro_my: t("intro"),
          }}
        />
      </PageHeader>

      {/* Steps, requirements + fees (editable) */}
      <AdmissionsSections
        fallback={{
          intro_en: t("intro"),
          intro_my: t("intro"),
          steps_title_en: t("stepsTitle"),
          steps_title_my: t("stepsTitle"),
          steps: (
            t.raw("steps") as { title: string; desc: string }[]
          ).map((step) => ({
            title_en: step.title,
            title_my: step.title,
            desc_en: step.desc,
            desc_my: step.desc,
          })),
          requirements_title_en: t("requirementsTitle"),
          requirements_title_my: t("requirementsTitle"),
          requirements_en: t.raw("requirements") as string[],
          requirements_my: t.raw("requirements") as string[],
          fees_title_en: t("feesTitle"),
          fees_title_my: t("feesTitle"),
          fees_subtitle_en: t("feesSubtitle"),
          fees_subtitle_my: t("feesSubtitle"),
          fees_note_en: t("feesNote"),
          fees_note_my: t("feesNote"),
          fees: (t.raw("fees") as { level: string; fee: string }[]).map(
            (row) => ({
              level_en: row.level,
              level_my: row.level,
              fee_en: row.fee,
              fee_my: row.fee,
            }),
          ),
        }}
      />

      {/* Inquiry form */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
        <InquiryForm />
      </section>
    </>
  );
}
