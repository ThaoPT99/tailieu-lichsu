import Link from "next/link";
import { Suspense } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DocFilters } from "./DocFilters";
import { getCategoryLabel } from "@/lib/doc-types";

export const dynamic = "force-dynamic";

type Doc = Awaited<ReturnType<typeof prisma.document.findMany>>[number];

export default async function TaiLieuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; grade?: string; price?: string }>;
}) {
  const { category, grade, price } = await searchParams;

  const where: Prisma.DocumentWhereInput = {};
  if (category && ["giao_an", "de_kiem_tra"].includes(category)) {
    where.category = category;
  }
  if (grade) {
    const g = parseInt(grade, 10);
    if ([6, 7, 8, 9].includes(g)) where.grade = g;
  }
  if (price === "free") {
    where.price = 0;
  } else if (price === "paid") {
    where.price = { gt: 0 };
  }

  const documents = await prisma.document.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold text-amber-900">Danh sách tài liệu</h1>
      <Suspense fallback={<div className="mb-6 h-12 animate-pulse rounded-xl bg-amber-100" />}>
        <DocFilters />
      </Suspense>

      {documents.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-16 text-center">
          <p className="text-stone-600">Chưa có tài liệu nào.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc: Doc) => (
            <Link
              key={doc.id}
              href={`/tai-lieu/${doc.id}`}
              className="group overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-40 items-center justify-center bg-amber-100/50">
                <span className="text-6xl">
                  {doc.fileType === "pdf"
                    ? "📄"
                    : doc.fileType === "docx"
                      ? "📝"
                      : doc.fileType === "zip"
                        ? "📦"
                        : "📊"}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-amber-900 line-clamp-2 group-hover:text-amber-700">
                  {doc.title}
                </h3>
                {(doc.category != null || doc.grade != null) && (
                  <p className="mt-0.5 text-xs text-amber-700">
                    {[getCategoryLabel(doc.category), doc.grade != null ? `Lớp ${doc.grade}` : ""]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                {doc.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-stone-500">
                    {doc.description}
                  </p>
                )}
                <div className="mt-2">
                  {doc.price > 0 ? (
                    <p className="font-medium text-amber-700">
                      {doc.originalPrice != null && doc.originalPrice > doc.price && (
                        <>
                          <span className="text-stone-400 line-through mr-1">
                            {doc.originalPrice.toLocaleString("vi-VN")} ₫
                          </span>
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 mr-1">
                            -{Math.round((1 - doc.price / doc.originalPrice) * 100)}%
                          </span>
                        </>
                      )}
                      {doc.price.toLocaleString("vi-VN")} ₫
                    </p>
                  ) : (
                    <p className="font-medium text-amber-700">Miễn phí</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
