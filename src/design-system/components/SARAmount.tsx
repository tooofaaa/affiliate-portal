"use client";

import React, { useMemo } from "react";
import { SARSymbol } from "./SARSymbol";
import { getLocale, getNumberFormatter } from "../utils/formatters";

interface Props {
  value: number | string;
  language?: "en" | "ar";
  short?: boolean;
  className?: string;
  showSymbol?: boolean;
}

export const SARAmount = React.memo(
  function SARAmount({ value, language, short = false, className, showSymbol = true }: Props) {
    const locale = useMemo(() => getLocale(language), [language]);
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
