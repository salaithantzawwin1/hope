import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  const links = [
    { href: "/", label: nav("home") },
    { href: "/about", label: nav("about") },
    { href: "/academics", label: nav("academics") },
    { href: "/admissions", label: nav("admissions") },
    { href: "/news", label: nav("news") },
    { href: "/downloads", label: nav("downloads") },
  ];

  return (
    <footer className="mt-auto bg-brand-dark text-slate-400">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo.jpg"
              alt="Hope International School logo"
              className="h-7 w-7 shrink-0 rounded-lg object-contain"
            />
            <div className="leading-tight">
              <div className="text-xs font-bold text-white">Hope</div>
              <div className="text-[9px] font-medium uppercase tracking-wider text-slate-500">
                International School
              </div>
            </div>
          </div>

          {/* Quick links */}
          <nav className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]" aria-label={t("quickLinks")}>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-slate-400 transition-colors hover:text-accent"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Contact */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
            <span className="flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-accent">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {t("address")}
            </span>
            <span className="flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-accent">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {t("phone")}
            </span>
            <span className="flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-accent">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              {t("email")}
            </span>
            <span className="flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-accent">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {t("hours")}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1 px-4 py-2 text-[10px] text-slate-500 sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()} Hope International School.{" "}
            {t("rights")}
          </p>
          <Link
            href="/admin"
            className="text-slate-500 transition-colors hover:text-accent"
          >
            {t("adminLink")}
          </Link>
        </div>
      </div>
    </footer>
  );
}