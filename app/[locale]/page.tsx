import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import SiteText from "@/components/SiteText";
import NewsEventsHome from "@/components/NewsEventsHome";
import FeaturedEvent from "@/components/FeaturedEvent";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });

  const stats = [
    { value: t("stats.students"), label: t("stats.studentsLabel") },
    { value: t("stats.teachers"), label: t("stats.teachersLabel") },
    { value: t("stats.years"), label: t("stats.yearsLabel") },
    { value: t("stats.ratio"), label: t("stats.ratioLabel") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-dark text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Bunner/01.jpg"
          alt=""
          aria-hidden
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-brand-dark/75"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-light/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-3xl">
            <SiteText
              k="home_hero_badge"
              en={t("heroBadge")}
              my={t("heroBadge")}
              as="p"
              className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-accent"
            />
            <SiteText
              k="home_hero_title"
              en={t("heroTitle")}
              my={t("heroTitle")}
              as="h1"
              className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
            />
            <SiteText
              k="home_hero_subtitle"
              en={t("heroSubtitle")}
              my={t("heroSubtitle")}
              as="p"
              className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-200"
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/admissions"
                className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-brand-dark shadow-lg transition-colors hover:bg-accent-dark"
              >
                {t("heroCta1")}
              </Link>
              <Link
                href="/academics"
                className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {t("heroCta2")}
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center backdrop-blur"
              >
                <div className="text-2xl font-bold text-accent sm:text-3xl">
                  {s.value}
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-300 sm:text-sm">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured event (first upcoming event with a flyer) */}
      <FeaturedEvent />

      {/* Welcome */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SiteText
              k="home_welcome_title"
              en={t("welcomeTitle")}
              my={t("welcomeTitle")}
              as="h2"
              className="text-3xl font-bold text-slate-900"
            />
            <SiteText
              k="home_welcome_text"
              en={t("welcomeText")}
              my={t("welcomeText")}
              as="p"
              className="mt-5 leading-relaxed text-slate-600"
            />
            <Link
              href="/about"
              className="mt-6 inline-block font-semibold text-brand hover:underline"
            >
              {t("welcomeLink")} →
            </Link>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Bunner/01.jpg"
                alt={t("welcomeTitle")}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-accent px-6 py-4 shadow-xl sm:block">
              <div className="text-3xl font-bold text-brand-dark">+12</div>
              <div className="text-sm font-medium text-brand-dark/80">
                {t("stats.yearsLabel")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-900">
              {t("programsTitle")}
            </h2>
            <p className="mt-3 text-slate-500">{t("programsSubtitle")}</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(t.raw("programs") as { title: string; desc: string }[]).map(
              (program, i) => (
                <div
                  key={program.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-xl font-bold text-brand">
                    {["A", "B", "C", "D"][i]}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    {program.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {program.desc}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* News & events */}
      <NewsEventsHome />

      {/* CTA */}
      <section className="relative overflow-hidden bg-brand text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold">{t("ctaTitle")}</h2>
            <p className="mt-3 text-slate-200">{t("ctaText")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admissions"
              className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-brand-dark shadow-lg transition-colors hover:bg-accent-dark"
            >
              {t("ctaButton")}
            </Link>
            <Link
              href="/admissions"
              className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {t("ctaSecondary")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}