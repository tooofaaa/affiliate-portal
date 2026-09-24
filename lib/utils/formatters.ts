import { formatCurrency, formatCurrencyShort } from "@/src/design-system";

export function getLocale(lang?: 'en' | 'ar'): "en-SA" | "ar-SA" {
  if (lang) return lang === 'ar' ? 'ar-SA' : 'en-SA';
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)portal-lang=([^;]+)/);
    if (match?.[1] === 'ar') return 'ar-SA';
  }
  return 'en-SA';
}

export { formatCurrency, formatCurrencyShort };

export function formatDate(dateStr: string | null | undefined, lang?: 'en' | 'ar'): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  const locale = getLocale(lang);
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}