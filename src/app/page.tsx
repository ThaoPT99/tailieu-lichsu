import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { buildDocumentWhere, type FilterParams } from "@/lib/document-filters";
import { DocFilters } from "@/app/tai-lieu/DocFilters";
import { DocCard } from "@/components/DocCard";

export const dynamic = "force-dynamic";

type Doc = Awaited<ReturnType<typeof prisma.document.findMany>>[number];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<FilterParams>;
}) {
  const params = await searchParams;
  const where = buildDocumentWhere(params);

  const documents = await prisma.document.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const { category, grade, price, q } = params;
  const allParams = new URLSearchParams();
  if (category) allParams.set("category", category);
  if (grade) allParams.set("grade", grade);
  if (price) allParams.set("price", price);
  if (q) allParams.set("q", q);
  const viewAllHref = allParams.toString() ? `/tai-lieu?${allParams}` : "/tai-lieu";

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
          <DocFilters basePath="/" showSearch={true} />
        </Suspense>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-amber-900">
            Tài liệu mới nhất
          </h2>
          <Link
            href={viewAllHref}
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
              <DocCard key={doc.id} doc={doc} variant="compact" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
