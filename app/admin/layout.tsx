import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin Portal | Hope International School",
};

// /admin lives outside the [locale] segment, so it needs its own root
// layout with <html> / <body> tags (Next.js 16 requirement for root
// layouts — see "multiple root layouts" in the Next.js docs).
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}