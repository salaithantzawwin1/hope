import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import SiteText from "@/components/SiteText";
import { HomeCta, HomePrograms, HomeStats } from "@/components/HomeContent";
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
        <div className="relative mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-20 sm:px-6 sm:py-28">
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

          {/* Stats (editable) */}
          <HomeStats
            fallback={{
              stats: [
                {
                  number_en: t("stats.students"),
                  number_my: t("stats.students"),
                  label_en: t("stats.studentsLabel"),
                  label_my: t("stats.studentsLabel"),
                },
                {
                  number_en: t("stats.teachers"),
                  number_my: t("stats.teachers"),
                  label_en: t("stats.teachersLabel"),
                  label_my: t("stats.teachersLabel"),
                },
                {
                  number_en: t("stats.years"),
                  number_my: t("stats.years"),
                  label_en: t("stats.yearsLabel"),
                  label_my: t("stats.yearsLabel"),
                },
                {
                  number_en: t("stats.ratio"),
                  number_my: t("stats.ratio"),
                  label_en: t("stats.ratioLabel"),
                  label_my: t("stats.ratioLabel"),
                },
              ],
            }}
          />
        </div>
      </section>

      {/* Featured event (first upcoming event with a flyer) */}
      <FeaturedEvent />

      {/* Welcome */}
      <section className="mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-16 sm:px-6 sm:py-24">
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

      {/* Programs (editable) */}
      <HomePrograms
        fallback={{
          title_en: t("programsTitle"),
          title_my: t("programsTitle"),
          subtitle_en: t("programsSubtitle"),
          subtitle_my: t("programsSubtitle"),
          programs: (t.raw("programs") as { title: string; desc: string }[]).map(
            (program) => ({
              title_en: program.title,
              title_my: program.title,
              desc_en: program.desc,
              desc_my: program.desc,
            }),
          ),
        }}
      />

      {/* News & events */}
      <NewsEventsHome />

      {/* CTA (editable) */}
      <HomeCta
        fallback={{
          title_en: t("ctaTitle"),
          title_my: t("ctaTitle"),
          text_en: t("ctaText"),
          text_my: t("ctaText"),
          button_en: t("ctaButton"),
          button_my: t("ctaButton"),
          secondary_en: t("ctaSecondary"),
          secondary_my: t("ctaSecondary"),
        }}
      />
    </>
  );
}