import Link from "next/link";
import { Suspense } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCategoryLabel } from "@/lib/doc-types";
import { DocFilters } from "@/app/tai-lieu/DocFilters";

export const dynamic = "force-dynamic";

type Doc = Awaited<ReturnType<typeof prisma.document.findMany>>[number];

export default async function HomePage({
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
    take: 6,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-amber-900 md:text-5xl">
          Kho Tài Liệu Lịch Sử Cấp 2
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-stone-600">
          Giáo án, bài giảng và tài liệu tham khảo môn Lịch sử. Xem trước miễn phí,
          tải xuống với mức phí hợp lý.
        </p>
      </section>

      <section>
        <Suspense fallback={<div className="mb-6 h-12 animate-pulse rounded-xl bg-amber-100" />}>
          <DocFilters basePath="/" />
        </Suspense>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-amber-900">
            Tài liệu mới nhất
          </h2>
          <Link
            href={(() => {
              const params = new URLSearchParams();
              if (category) params.set("category", category);
              if (grade) params.set("grade", grade);
              if (price) params.set("price", price);
              const q = params.toString();
              return q ? `/tai-lieu?${q}` : "/tai-lieu";
            })()}
            className="text-amber-700 hover:text-amber-800 hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>

        {documents.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-16 text-center">
            <p className="text-stone-600">
              Chưa có tài liệu nào. Vào trang Quản trị để tải lên.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc: Doc) => (
              <Link
                key={doc.id}
                href={`/tai-lieu/${doc.id}`}
                className="group overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-32 items-center justify-center bg-amber-100/50">
                  <span className="text-5xl">
                    {doc.fileType === "pdf"
                      ? "📄"
                      : doc.fileType === "docx"
                        ? "📝"
                        : "📊"}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-amber-900 line-clamp-2 group-hover:text-amber-700">
                    {doc.title}
                  </h3>
                  <p className="mt-1 text-sm text-stone-500">
                    {[
                      doc.category ? getCategoryLabel(doc.category) : null,
                      doc.grade != null ? `Lớp ${doc.grade}` : null,
                      doc.fileType.toUpperCase(),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-2 font-medium text-amber-700">
                    {doc.price > 0
                      ? `${doc.price.toLocaleString("vi-VN")} ₫`
                      : "Miễn phí"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
