const MY_MONTHS = [
  "ဇန်နဝါရီ",
  "ဖေဖော်ဝါရီ",
  "မတ်",
  "ဧပြီ",
  "မေ",
  "ဇွန်",
  "ဇူလိုင်",
  "ဩဂုတ်",
  "စက်တင်ဘာ",
  "အောက်တိုဘာ",
  "နိုဝင်ဘာ",
  "ဒီဇင်ဘာ",
];

const MY_DAYS = [
  "တနင်္ဂနွေ",
  "တနင်္လာ",
  "အင်္ဂါ",
  "ဗုဒ္ဓဟူး",
  "ကြာသပတေး",
  "သောကြာ",
  "စနေ",
];

export function formatDate(iso: string, locale: string): string {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;

  if (locale === "my") {
    return `${MY_DAYS[d.getDay()]}, ${d.getDate()} ${MY_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Short form, e.g. "Sep 15" / "၁၅ စက်တင်ဘာ". */
export function formatDateShort(iso: string, locale: string): string {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (locale === "my") {
    return `${d.getDate()} ${MY_MONTHS[d.getMonth()]}`;
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Month name only, e.g. "Sep" / "စက်တင်ဘာ". */
export function monthShort(iso: string, locale: string): string {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return "";
  if (locale === "my") return MY_MONTHS[d.getMonth()];
  return d.toLocaleDateString("en-US", { month: "short" });
}