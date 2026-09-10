import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PageHeader from "@/components/PageHeader";
import SiteText from "@/components/SiteText";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "carrier" });
  return { title: t("title") };
}

export default async function CarrierPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "carrier" });

  return (
    <>
      {/* Page header */}
      <PageHeader title={t("title")}>
        <SiteText
          k="carrier_intro"
          en={t("intro")}
          my={t("intro")}
          as="p"
          className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200"
        />
      </PageHeader>

      {/* Why join us */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {t("whyJoinTitle")}
        </h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">
          {t("whyJoinText")}
        </p>
      </section>

      {/* Open positions */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {t("positionsTitle")}
          </h2>
          <p className="mt-3 text-slate-500">
            {t("positionsSubtitle")}
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Position cards will be populated here */}
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              {t("noPositions")}
            </div>
          </div>
        </div>
      </section>

      {/* How to apply */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {t("howToApplyTitle")}
        </h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <li className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-base font-bold text-white">
              1
            </span>
            <h3 className="mt-4 font-bold leading-snug text-slate-900">
              {t("step1Title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {t("step1Desc")}
            </p>
          </li>
          <li className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-base font-bold text-white">
              2
            </span>
            <h3 className="mt-4 font-bold leading-snug text-slate-900">
              {t("step2Title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {t("step2Desc")}
            </p>
          </li>
          <li className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-base font-bold text-white">
              3
            </span>
            <h3 className="mt-4 font-bold leading-snug text-slate-900">
              {t("step3Title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {t("step3Desc")}
            </p>
          </li>
          <li className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-base font-bold text-white">
              4
            </span>
            <h3 className="mt-4 font-bold leading-snug text-slate-900">
              {t("step4Title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {t("step4Desc")}
            </p>
          </li>
        </ol>
      </section>

      {/* CTA */}
      <section className="mx-4 mb-12 overflow-hidden rounded-3xl bg-brand-light text-white sm:mx-6">
        <div className="mx-auto flex max-w-7xl 2xl:max-w-[1440px] flex-col items-start justify-between gap-5 px-4 py-10 sm:px-6 sm:py-12 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold sm:text-3xl">{t("ctaTitle")}</h2>
            <p className="mt-1.5 text-sm text-slate-100">{t("ctaText")}</p>
          </div>
          <a
            href={`mailto:${t("ctaEmail")}`}
            className="shrink-0 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-brand-dark shadow transition-colors hover:bg-accent-dark"
          >
            {t("ctaButton")}
          </a>
        </div>
      </section>
    </>
  );
}
