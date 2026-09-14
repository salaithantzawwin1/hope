import type { ReactNode } from "react";

/**
 * Compact dark-blue page header shared by the inner pages. Much slimmer than
 * the old full-height hero (smaller padding and type), so the real page
 * content reaches the fold sooner while keeping the brand band.
 *
 * Every inner page uses this component so its brand band is identical in
 * height and type scale; pages that want the eyebrow pill + gradient
 * treatment (Carrier, Contact) opt in with the extra props instead of
 * rolling their own band at a different size.
 */
export default function PageHeader({
  title,
  eyebrow,
  gradient = false,
  children,
}: {
  title: string;
  /** Small pill label shown above the title (Carrier/Contact style). */
  eyebrow?: string;
  /** Brand-gradient backdrop behind the band (Carrier/Contact treatment). */
  gradient?: boolean;
  children?: ReactNode;
}) {
  return (
    <section
      className={`relative bg-brand-dark text-white ${gradient ? "overflow-hidden" : ""}`}
    >
      {gradient && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-dark via-brand to-brand-light opacity-90"
        />
      )}
      <div className="relative mx-auto max-w-7xl 2xl:max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
        {eyebrow && (
          <span className="mb-2 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-xs font-medium text-accent">
            {eyebrow}
          </span>
        )}
        <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
        {children}
      </div>
    </section>
  );
}
