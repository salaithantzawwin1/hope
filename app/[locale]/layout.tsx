import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import localFont from "next/font/local";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { routing } from "@/i18n/routing";
import "../globals.css";

// Fonts are self-hosted (downloaded into public/fonts/ from Fontsource) so the
// build never needs to reach fonts.googleapis.com — which is unreachable on
// this network — and Myanmar visitors don't depend on Google either.
const inter = localFont({
  src: "../../public/fonts/inter-var.woff2",
  variable: "--font-inter",
  display: "swap",
});

const notoMyanmar = localFont({
  src: "../../public/fonts/noto-sans-myanmar-var.woff2",
  variable: "--font-noto-myanmar",
  weight: "100 900",
  display: "swap",
  // The 150 KB Myanmar font is only actually used on /my pages, yet Next
  // preload-listed it on every English page too — Chrome fetched it, left
  // it unused, and logged "preloaded using link preload but not used" on
  // every visit. Load it on demand instead (font-display: swap keeps the
  // Burmese text visible while it arrives).
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: {
      default: "Hope International School",
      template: "%s | Hope International School",
    },
    description: t("heroSubtitle"),
    openGraph: {
      title: "Hope International School",
      description: t("heroSubtitle"),
      locale: locale === "my" ? "my_MM" : "en_US",
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${notoMyanmar.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white">
        {/* locale is passed explicitly so client components (Header switcher,
            dynamic content) always resolve the correct locale on static pages */}
        <NextIntlClientProvider locale={locale}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}