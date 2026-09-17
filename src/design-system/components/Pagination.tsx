"use client";

import React, { useCallback, useMemo } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function ChevronLeftSvg() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightSvg() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export const Pagination = React.memo(
  function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage = 10,
    totalItems = 0,
    showPageSizeSelector = false,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    onPageSizeChange,
    className = "",
  }: PaginationProps) {
    const { t } = useLanguage();
    const tp = (t as Record<string, any>).pagination ?? {};

    const visiblePages = useMemo<(number | "ellipsis")[]>(() => {
      const pages: (number | "ellipsis")[] = [];
      const maxVisible = 5;

      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
          pages.push(i);
        } else if (pages[pages.length - 1] !== "ellipsis") {
          pages.push("ellipsis");
        }
      }

      return pages;
    }, [currentPage, totalPages]);

    const handlePageChange = useCallback(
      (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
          onPageChange(page);
        }
      },
      [currentPage, totalPages, onPageChange]
    );

    if (totalPages <= 1) return null;

    return (
      <div
        className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
        role="navigation"
        aria-label={tp.label ?? "Pagination"}
      >
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="page-size" className="text-sm font-medium text-gray-700">
              {tp.pageSize || "Items per page:"}
            </label>
            <select
              id="page-size"
              value={itemsPerPage}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {totalItems > 0 && (
          <span className="text-sm text-gray-500">
            {tp.showing || "Showing"} {(currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, totalItems)} {tp.of || "of"} {totalItems}
          </span>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            aria-label={tp.previous || "Previous page"}
          >
            <ChevronLeftSvg />
          </button>

          {visiblePages.map((page, index) =>
            page === "ellipsis" ? (
              <span key={`e-${index}`} className="px-2 text-gray-400" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                  currentPage === page
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-indigo-50"
                }`}
                aria-label={`${tp.page || "Page"} ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            aria-label={tp.next || "Next page"}
          >
            <ChevronRightSvg />
          </button>
        </div>
      </div>
    );
  }
);

Pagination.displayName = "Pagination";

export { DEFAULT_PAGE_SIZE_OPTIONS };