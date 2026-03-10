export const DOC_CATEGORIES = [
  { value: "giao_an", label: "Giáo án" },
  { value: "de_kiem_tra", label: "Đề kiểm tra" },
] as const;

export const DOC_GRADES = [6, 7, 8, 9] as const;

export type DocCategory = (typeof DOC_CATEGORIES)[number]["value"];
export type DocGrade = (typeof DOC_GRADES)[number];

export function getCategoryLabel(value: string | null): string {
  if (!value) return "Chưa phân loại";
  const c = DOC_CATEGORIES.find((x) => x.value === value);
  return c?.label ?? value;
}

export function getGradeLabel(value: number | null): string {
  if (value == null) return "—";
  return `Lớp ${value}`;
}
