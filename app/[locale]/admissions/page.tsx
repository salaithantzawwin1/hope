import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import InquiryForm from "@/components/InquiryForm";
import PageHeader from "@/components/PageHeader";

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

  const steps = t.raw("steps") as { title: string; desc: string }[];
  const requirements = t.raw("requirements") as string[];
  const fees = t.raw("fees") as { level: string; fee: string }[];

  return (
    <>
      {/* Page header */}
      <PageHeader title={t("title")}>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200">
          {t("intro")}
        </p>
      </PageHeader>

      {/* Steps */}
      <section className="mx-auto max-w-6xl xl:max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {t("stepsTitle")}
        </h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-base font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-bold leading-snug text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Requirements + fees */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl xl:max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              {t("requirementsTitle")}
            </h2>
            <ul className="mt-5 space-y-3">
              {requirements.map((req) => (
                <li key={req} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs text-brand">
                    ✓
                  </span>
                  <span className="text-sm leading-relaxed text-slate-700">
                    {req}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              {t("feesTitle")}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{t("feesSubtitle")}</p>
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-brand text-white">
                    <th className="px-4 py-3 font-semibold">
                      {t("feesTable.level")}
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      {t("feesTable.fee")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((row, i) => (
                    <tr
                      key={row.level}
                      className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {row.level}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate-400">{t("feesNote")}</p>
          </div>
        </div>
      </section>

      {/* Inquiry form */}
      <section className="mx-auto max-w-6xl xl:max-w-7xl px-4 py-12 sm:px-6">
        <InquiryForm />
      </section>
    </>
  );
}