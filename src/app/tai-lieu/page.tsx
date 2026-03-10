import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Doc = Awaited<ReturnType<typeof prisma.document.findMany>>[number];

export default async function TaiLieuPage() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-amber-900">Danh sách tài liệu</h1>

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
                      : "📊"}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-amber-900 line-clamp-2 group-hover:text-amber-700">
                  {doc.title}
                </h3>
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
