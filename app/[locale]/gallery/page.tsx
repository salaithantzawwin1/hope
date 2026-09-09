import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Gallery from "@/components/Gallery";
import PageHeader from "@/components/PageHeader";

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
      {/* Page header */}
      <PageHeader title={t("title")}>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200">
          {t("subtitle")}
        </p>
      </PageHeader>

      {/* Albums (each photo album renders as its own titled section) */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-12 sm:px-6">
        <Gallery />
      </section>
    </>
  );
}