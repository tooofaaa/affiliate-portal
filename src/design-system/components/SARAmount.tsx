"use client";

import { SARSymbol } from "./SARSymbol";

interface Props {
  value: number | string;
  language?: "en" | "ar";
  short?: boolean;
  className?: string;
  showSymbol?: boolean;
}

function getLocale(lang?: "en" | "ar"): string {
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

export function SARAmount({ value, language, short = false, className, showSymbol = true }: Props) {
  const numeric = typeof value === "string" ? parseFloat(value) : value;
  const locale = getLocale(language);
  const isArabic = locale === "ar-SA";

  const formatted = isNaN(numeric)
    ? isArabic ? "٠٫٠٠" : "0.00"
    : new Intl.NumberFormat(locale, {
        minimumFractionDigits: short ? 0 : 2,
        maximumFractionDigits: 2,
        notation: short ? "compact" : "standard",
      }).format(numeric);

  return (
    <span className={className} style={{ whiteSpace: "nowrap" }}>
      {showSymbol ? (
        isArabic ? (
          <>
            {formatted}&nbsp;<SARSymbol size="0.9em" />
          </>
        ) : (
          <>
            <SARSymbol size="0.9em" />&nbsp;{formatted}
          </>
        )
      ) : (
        formatted
      )}
    </span>
  );
}

// Unified formatCurrency function for non-component usage
export function formatCurrency(amount: number | string, lang?: "en" | "ar"): string {
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return "﷼ 0";

  const locale = getLocale(lang);
  const isArabic = locale === "ar-SA";

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);

  return isArabic ? `${formatted} ﷼` : `﷼ ${formatted}`;
}

export function formatCurrencyShort(amount: number | string, lang?: "en" | "ar"): string {
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return "﷼ 0";

  const locale = getLocale(lang);
  const isArabic = locale === "ar-SA";

  const formatted = new Intl.NumberFormat(locale, {
    notation: "compact",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);

  return isArabic ? `${formatted} ﷼` : `﷼ ${formatted}`;
}