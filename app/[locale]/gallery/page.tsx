import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Gallery from "@/components/Gallery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });
  return { title: t("title") };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "gallery" });

  return (
    <>
      {/* Header */}
      <section className="bg-brand-dark text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <h1 className="text-2xl font-bold sm:text-3xl">{t("title")}</h1>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-slate-200">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Albums (each photo album renders as its own titled section) */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Gallery />
      </section>
    </>
  );
}