/**
 * Every public page the site actually ships, as locale-less paths.
 *
 * The header and footer links are editable in the admin portal, so staff can
 * point them anywhere — including at a page that does not exist. That really
 * happened: the live site's header and footer both carried a "Downloads" link
 * while no /downloads page had ever been built, and the footer rendered it as
 * a 404 once the saved links were shown verbatim.
 *
 * Rendering only known internal paths keeps a typo or a removed page from
 * shipping a broken link, and the admin's link editor warns about the ones it
 * skips so nothing disappears silently. Keep this list in step with the
 * folders under app/[locale]/.
 */
export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/academics",
  "/admissions",
  "/carrier",
  "/contact",
  "/gallery",
  "/news",
  "/register",
] as const;

/**
 * True when a link points at a path this site does not serve — the caller
 * should leave it out rather than publish a 404. Anything that is not a
 * root-relative path (external URLs, mailto:, tel:, in-page #anchors) is not
 * ours to judge and returns false.
 */
export function isUnknownInternalPath(href: string): boolean {
  const path = href.trim();
  // "//example.com" is protocol-relative, i.e. someone else's site.
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  const clean = path.replace(/\/+$/, "") || "/";
  return !(PUBLIC_ROUTES as readonly string[]).includes(clean);
}
