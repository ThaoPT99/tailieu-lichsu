import Link from "next/link";
import { getCategoryLabel } from "@/lib/doc-types";

type Doc = {
  id: string;
  title: string;
  description: string | null;
  fileType: string;
  price: number;
  originalPrice: number | null;
  category: string | null;
  grade: number | null;
};

function getFileIcon(fileType: string) {
  switch (fileType) {
    case "pdf":
      return "📄";
    case "docx":
      return "📝";
    case "zip":
      return "📦";
    default:
      return "📊";
  }
}

type DocCardProps = {
  doc: Doc;
  variant?: "compact" | "full";
};

export function DocCard({ doc, variant = "full" }: DocCardProps) {
  const isCompact = variant === "compact";

  return (
    <Link
      href={`/tai-lieu/${doc.id}`}
      className="group overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div
        className={`flex items-center justify-center bg-amber-100/50 ${isCompact ? "h-32" : "h-40"}`}
      >
        <span className={isCompact ? "text-5xl" : "text-6xl"}>
          {getFileIcon(doc.fileType)}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-amber-900 line-clamp-2 group-hover:text-amber-700">
          {doc.title}
        </h3>
        {isCompact ? (
          <p className="mt-1 text-sm text-stone-500">
            {[
              doc.category ? getCategoryLabel(doc.category) : null,
              doc.grade != null ? `Lớp ${doc.grade}` : null,
              doc.fileType.toUpperCase(),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : (
          <>
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
          </>
        )}
        <div className="mt-2">
          {doc.price > 0 ? (
            <p className="font-medium text-amber-700">
              {doc.originalPrice != null && doc.originalPrice > doc.price && (
                <>
                  <span className="mr-1 line-through text-stone-400">
                    {doc.originalPrice.toLocaleString("vi-VN")} ₫
                  </span>
                  <span className="mr-1 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
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
  );
}
