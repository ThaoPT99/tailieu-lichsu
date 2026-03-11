import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import {
  buildDocumentWhere,
  getPageFromParams,
  DOCS_PER_PAGE,
  type FilterParams,
} from "@/lib/document-filters";
import { DocFilters } from "./DocFilters";
import { DocCard } from "@/components/DocCard";
import { Pagination } from "@/components/Pagination";

export const dynamic = "force-dynamic";

type Doc = Awaited<ReturnType<typeof prisma.document.findMany>>[number];

export default async function TaiLieuPage({
  searchParams,
}: {
  searchParams: Promise<FilterParams>;
}) {
  const params = await searchParams;
  const where = buildDocumentWhere(params);
  const page = getPageFromParams(params);
  const skip = (page - 1) * DOCS_PER_PAGE;

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { createdAt: "desc" },
      skip,
      take: DOCS_PER_PAGE,
    }),
    prisma.document.count({
      where: Object.keys(where).length ? where : undefined,
    }),
  ]);

  const totalPages = Math.ceil(total / DOCS_PER_PAGE) || 1;
  const searchParamsObj = new URLSearchParams();
  if (params.category) searchParamsObj.set("category", params.category);
  if (params.grade) searchParamsObj.set("grade", params.grade);
  if (params.price) searchParamsObj.set("price", params.price);
  if (params.q) searchParamsObj.set("q", params.q);
  if (page > 1) searchParamsObj.set("page", String(page));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold text-amber-900">Danh sách tài liệu</h1>
      <Suspense fallback={<div className="mb-6 h-12 animate-pulse rounded-xl bg-amber-100" />}>
        <DocFilters />
      </Suspense>

      {documents.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-16 text-center">
          <p className="text-stone-600">Không tìm thấy tài liệu phù hợp.</p>
          <p className="mt-1 text-sm text-stone-500">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc: Doc) => (
              <DocCard key={doc.id} doc={doc} variant="full" />
            ))}
          </div>
          <Pagination
            basePath="/tai-lieu"
            currentPage={page}
            totalPages={totalPages}
            searchParams={searchParamsObj}
          />
        </>
      )}
    </div>
  );
}
