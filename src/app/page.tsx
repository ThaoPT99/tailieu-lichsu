import Link from "next/link";
import { prisma } from "@/lib/prisma";

type Doc = Awaited<ReturnType<typeof prisma.document.findMany>>[number];

export default async function HomePage() {
  const documents = await prisma.document.findMany({
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
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-amber-900">
            Tài liệu mới nhất
          </h2>
          <Link
            href="/tai-lieu"
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
                  <p className="mt-1 text-sm text-stone-500">{doc.fileType.toUpperCase()}</p>
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
