"use client";

import React, { useMemo } from "react";
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

// Memoized locale getter
const getLocaleMemo = useMemo(
  () => (lang?: "en" | "ar") => {
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
  }, []);

// Memoized number formatter cache
const formatterCache = new Map<string, Intl.NumberFormat>();

function getNumberFormatter(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}-${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
}

export const SARAmount = React.memo(
  function SARAmount({ value, language, short = false, className, showSymbol = true }: Props) {
    const locale = useMemo(() => getLocaleMemo(language), [language]);
    const isArabic = locale === "ar-SA";

    const formatted = useMemo(() => {
      const numeric = typeof value === "string" ? parseFloat(value) : value;
      if (isNaN(numeric)) return isArabic ? "٠٫٠٠" : "0.00";

      const formatter = getNumberFormatter(locale, {
        minimumFractionDigits: short ? 0 : 2,
        maximumFractionDigits: 2,
        notation: short ? "compact" : "standard",
      });
      return formatter.format(numeric);
    }, [value, locale, short]);

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
  },
);

SARAmount.displayName = "SARAmount";

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