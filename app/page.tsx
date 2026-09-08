"use client";

import { useEffect } from "react";

// With a fully static export there is no server to negotiate the locale,
// so the root path redirects client-side based on the visitor's language.
export default function RootPage() {
  useEffect(() => {
    const lang = (navigator.language || "en").toLowerCase();
    const target = lang.startsWith("my") ? "/my" : "/en";
    window.location.replace(target);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        color: "#1e3a8a",
      }}
    >
      Redirecting…
    </div>
  );
}