import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DocumentView } from "./DocumentView";
import { DownloadSection } from "./DownloadSection";

export const dynamic = "force-dynamic";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-900">{document.title}</h1>
        {document.description && (
          <p className="mt-2 text-stone-600">{document.description}</p>
        )}
        <p className="mt-2 text-sm text-stone-500">
          {document.fileType.toUpperCase()} •{" "}
          {document.price > 0
            ? `${document.price.toLocaleString("vi-VN")} ₫ để tải xuống`
            : "Miễn phí"}
        </p>
      </div>

      <div className="space-y-6">
        <DocumentView document={document} />
        <DownloadSection document={document} />
      </div>
    </div>
  );
}
