export function formatDate(dateStr: string | null | undefined, lang?: 'en' | 'ar'): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  const locale = lang === 'ar' ? 'ar-SA' : 'en-SA';
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}