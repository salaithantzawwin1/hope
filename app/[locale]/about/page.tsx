import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AboutContent from "@/components/AboutContent";
import SiteText from "@/components/SiteText";
import Gallery from "@/components/Gallery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });

  const values = t.raw("values") as { title: string; desc: string }[];
  const facts = t.raw("facts") as { number: string; label: string }[];

  return (
    <>
      {/* Header */}
      <section className="bg-brand-dark text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <h1 className="text-2xl font-bold sm:text-3xl">{t("title")}</h1>
          <SiteText
            k="about_intro"
            en={t("intro")}
            my={t("intro")}
            as="p"
            className="mt-2 max-w-3xl text-base leading-relaxed text-slate-200"
          />
        </div>
      </section>

      {/* Mission & vision, values, facts (editable) */}
      <AboutContent
        fallback={{
          missionVision: {
            mission_title_en: t("missionTitle"),
            mission_title_my: t("missionTitle"),
            mission_text_en: t("missionText"),
            mission_text_my: t("missionText"),
            vision_title_en: t("visionTitle"),
            vision_title_my: t("visionTitle"),
            vision_text_en: t("visionText"),
            vision_text_my: t("visionText"),
          },
          values: {
            title_en: t("valuesTitle"),
            title_my: t("valuesTitle"),
            values: values.map((v) => ({
              title_en: v.title,
              title_my: v.title,
              desc_en: v.desc,
              desc_my: v.desc,
            })),
          },
          facts: {
            title_en: t("factsTitle"),
            title_my: t("factsTitle"),
            facts: facts.map((f) => ({
              number_en: f.number,
              number_my: f.number,
              label_en: f.label,
              label_my: f.label,
            })),
          },
        }}
      />

      {/* Gallery */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {t("galleryTitle")}
            </h2>
            <p className="mt-2 text-slate-500">{t("gallerySubtitle")}</p>
          </div>
          <Gallery />
        </div>
      </section>
    </>
  );
}