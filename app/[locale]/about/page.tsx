import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h1 className="text-3xl font-bold sm:text-4xl">{t("title")}</h1>
          <SiteText
            k="about_intro"
            en={t("intro")}
            my={t("intro")}
            as="p"
            className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-200"
          />
        </div>
      </section>

      {/* Mission & vision */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border-t-4 border-accent bg-cream p-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden>🎯</span>
              <h2 className="text-xl font-bold text-slate-900">
                {t("missionTitle")}
              </h2>
            </div>
            <p className="mt-4 leading-relaxed text-slate-600">
              {t("missionText")}
            </p>
          </div>
          <div className="rounded-3xl border-t-4 border-brand bg-cream p-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden>🔭</span>
              <h2 className="text-xl font-bold text-slate-900">
                {t("visionTitle")}
              </h2>
            </div>
            <p className="mt-4 leading-relaxed text-slate-600">
              {t("visionText")}
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900">
            {t("valuesTitle")}
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <div
                key={value.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-xl font-bold text-brand">
                  {["🤝", "⚖️", "🌟", "🏘️"][i]}
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facts */}
      <section className="bg-brand text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            {t("factsTitle")}
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center"
              >
                <div className="text-3xl font-bold text-accent">
                  {fact.number}
                </div>
                <div className="mt-1.5 text-sm text-slate-200">{fact.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

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