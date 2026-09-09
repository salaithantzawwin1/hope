import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PageHeader from "@/components/PageHeader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "downloads" });
  return { title: t("title") };
}

export default async function DownloadsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "downloads" });

  // Static list of documents. Drop new files into public/docs/ and add a
  // matching entry in messages/<locale>.json under "downloads.docs".
  const docs = t.raw("docs") as { file: string; name: string; desc: string }[];

  return (
    <>
      {/* Page header */}
      <PageHeader title={t("title")}>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200">
          {t("subtitle")}
        </p>
      </PageHeader>

      {/* Documents */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <div
              key={doc.file}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-xl"
                aria-hidden
              >
                📄
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-900">
                {doc.name}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                {doc.desc}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={doc.file}
                  download
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  {t("download")} ↓
                </a>
                <a
                  href={doc.file}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-brand hover:text-brand"
                >
                  {t("view")}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}