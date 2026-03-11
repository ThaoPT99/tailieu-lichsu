import type { Metadata } from "next";
import type { FilterParams } from "@/lib/document-filters";

export function buildTaiLieuMetadata(params: FilterParams): Metadata {
  const parts: string[] = [];
  if (params.category && ["giao_an", "de_kiem_tra"].includes(params.category)) {
    parts.push(params.category === "giao_an" ? "Giáo án" : "Đề kiểm tra");
  }
  if (params.grade) {
    const g = parseInt(params.grade, 10);
    if ([6, 7, 8, 9].includes(g)) parts.push(`Lớp ${g}`);
  }
  if (params.price === "free") parts.push("Miễn phí");
  else if (params.price === "paid") parts.push("Có phí");
  if (params.q?.trim()) parts.push(`"${params.q.trim()}"`);

  const suffix = parts.length > 0 ? ` - ${parts.join(" · ")}` : "";
  const title = `Danh sách tài liệu${suffix} | Tài Liệu Lịch Sử`;
  const description =
    parts.length > 0
      ? `Tìm kiếm tài liệu Lịch sử${suffix}. Xem trước miễn phí, tải xuống có phí.`
      : "Kho giáo án và đề kiểm tra Lịch sử lớp 6, 7, 8, 9 - Xem miễn phí, tải xuống có phí.";

  return { title, description };
}
