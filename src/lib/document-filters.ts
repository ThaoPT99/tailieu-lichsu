import type { Prisma } from "@prisma/client";

export type FilterParams = {
  category?: string;
  grade?: string;
  price?: string;
  q?: string;
  page?: string;
};

export const DOCS_PER_PAGE = 12;

export function buildDocumentWhere(params: FilterParams): Prisma.DocumentWhereInput {
  const { category, grade, price, q } = params;
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
  if (q && q.trim()) {
    const term = q.trim();
    where.OR = [
      { title: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
    ];
  }

  return where;
}

export function getPageFromParams(params: FilterParams): number {
  const page = parseInt(params.page ?? "1", 10);
  return page >= 1 ? page : 1;
}
