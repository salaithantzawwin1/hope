import * as rootParams from "next/root-params";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const paramValue = await rootParams.locale();
    if (hasLocale(routing.locales, paramValue)) {
      locale = paramValue;
    }
  }

  // Validate the locale regardless of where it came from. Pages call
  // getTranslations({ locale }) with the raw `[locale]` URL segment, which
  // skips the guard in app/[locale]/layout.tsx — so an unknown segment such as
  // /xx/news or a stray /api/news would try to import ../messages/<segment>.json
  // and surface as a 500. A missing locale is simply a 404.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});