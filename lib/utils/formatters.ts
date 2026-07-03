function getLocale(lang?: 'en' | 'ar'): string {
  if (lang) return lang === 'ar' ? 'ar-SA' : 'en-SA';
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)portal-lang=([^;]+)/);
    if (match?.[1] === 'ar') return 'ar-SA';
  }
  return 'en-SA';
}

export function formatCurrency(amount: number, lang?: 'en' | 'ar'): string {
  const locale = getLocale(lang);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

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
