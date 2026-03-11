"use client";

import Link from "next/link";

type PaginationProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  searchParams: URLSearchParams;
};

export function Pagination({ basePath, currentPage, totalPages, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) params.delete("page");
    else params.set("page", String(page));
    const q = params.toString();
    const path = basePath === "/" ? "" : basePath;
    return `${path}${q ? `?${q}` : ""}` || "/";
  };

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Phân trang">
      {currentPage > 1 && (
        <Link
          href={buildUrl(currentPage - 1)}
          className="rounded-lg border border-amber-200 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50"
        >
          ← Trước
        </Link>
      )}
      <span className="rounded-lg bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900">
        Trang {currentPage} / {totalPages}
      </span>
      {currentPage < totalPages && (
        <Link
          href={buildUrl(currentPage + 1)}
          className="rounded-lg border border-amber-200 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50"
        >
          Sau →
        </Link>
      )}
    </nav>
  );
}
