import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Inter, Noto_Sans_Myanmar } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { routing } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoMyanmar = Noto_Sans_Myanmar({
  weight: ["400", "500", "600", "700"],
  subsets: ["myanmar"],
  variable: "--font-noto-myanmar",
  display: "swap",
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