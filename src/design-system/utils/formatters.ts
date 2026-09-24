// Shared formatting utilities (no React) — kept in a non-component module so
// files that mix component + value exports don't break Fast Refresh boundaries.

export function getLocale(lang?: "en" | "ar"): string {
  if (lang) return lang === "ar" ? "ar-SA" : "en-SA";
  if (typeof document !== "undefined") {
    const cookieName = document.cookie.includes("ps-inventory-lang")
      ? "ps-inventory-lang"
      : document.cookie.includes("supplier-lang")
      ? "supplier-lang"
      : document.cookie.includes("portal-lang")
      ? "portal-lang"
      : null;
    if (cookieName) {
      const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));
      if (match?.[1] === "ar") return "ar-SA";
    }
  }
  return "en-SA";
}

// Memoized number formatter cache
const formatterCache = new Map<string, Intl.NumberFormat>();

export function getNumberFormatter(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}-${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
}

// Unified formatCurrency function for non-component usage
export function formatCurrency(amount: number | string, lang?: "en" | "ar"): string {
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return "﷼ 0";

  const locale = getLocale(lang);
  const isArabic = locale === "ar-SA";

  const formatter = getNumberFormatter(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formatted = formatter.format(numeric);

  return isArabic ? `${formatted} ﷼` : `﷼ ${formatted}`;
}

export function formatCurrencyShort(amount: number | string, lang?: "en" | "ar"): string {
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return "﷼ 0";

  const locale = getLocale(lang);
  const isArabic = locale === "ar-SA";

  const formatter = getNumberFormatter(locale, {
    notation: "compact",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formatted = formatter.format(numeric);

  return isArabic ? `${formatted} ﷼` : `﷼ ${formatted}`;
}
