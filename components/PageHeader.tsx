import type { ReactNode } from "react";

/**
 * Compact dark-blue page header shared by the inner pages. Much slimmer than
 * the old full-height hero (smaller padding and type), so the real page
 * content reaches the fold sooner while keeping the brand band.
 */
export default function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-brand-dark text-white">
      <div className="mx-auto max-w-6xl xl:max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
        {children}
      </div>
    </section>
  );
}