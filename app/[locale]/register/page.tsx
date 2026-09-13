import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PageHeader from "@/components/PageHeader";
import RegisterPageContent from "@/components/RegisterPageContent";
import {
  RegisterContactBox,
  RegisterIntro,
  RegisterSteps,
} from "@/components/RegisterEditable";
import { FALLBACK_REGISTER } from "@/lib/fallback-data";
import type { RegisterContent } from "@/lib/types";

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

  // Everything below the page title is editable in the admin portal
  // (Admin → Register). The message catalog is only the initial fallback, so
  // it is read for the active locale and passed as both languages — the same
  // rule the Home page uses; a saved block always wins.
  const catalogSteps = t.raw("steps") as { title: string; desc: string }[];
  const registerFallback: RegisterContent = {
    ...FALLBACK_REGISTER,
    intro_en: t("intro"),
    intro_my: t("intro"),
    steps_title_en: t("stepsTitle"),
    steps_title_my: t("stepsTitle"),
    steps: catalogSteps.map((step) => ({
      title_en: step.title,
      title_my: step.title,
      desc_en: step.desc,
      desc_my: step.desc,
    })),
    questions_title_en: t("questionsTitle"),
    questions_title_my: t("questionsTitle"),
    questions_text_en: t("questionsText"),
    questions_text_my: t("questionsText"),
  };

  return (
    <>
      {/* Page header */}
      <PageHeader title={t("title")}>
        <RegisterIntro fallback={registerFallback} />
      </PageHeader>

      {/* Steps */}
      <RegisterSteps fallback={registerFallback} />

      {/* Form */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-7xl 2xl:max-w-[1440px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RegisterPageContent />
          </div>

          {/* Contact box */}
          <RegisterContactBox fallback={registerFallback} />
        </div>
      </section>
    </>
  );
}
