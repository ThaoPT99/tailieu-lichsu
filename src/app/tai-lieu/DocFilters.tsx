"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DOC_CATEGORIES, DOC_GRADES } from "@/lib/doc-types";

export function DocFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const grade = searchParams.get("grade") ?? "";
  const price = searchParams.get("price") ?? "";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/tai-lieu${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
      <span className="text-sm font-medium text-amber-900">Lọc:</span>
      <select
        value={category}
        onChange={(e) => updateFilter("category", e.target.value)}
        className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
      >
        <option value="">Tất cả loại</option>
        {DOC_CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <select
        value={grade}
        onChange={(e) => updateFilter("grade", e.target.value)}
        className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
      >
        <option value="">Tất cả lớp</option>
        {DOC_GRADES.map((g) => (
          <option key={g} value={g}>
            Lớp {g}
          </option>
        ))}
      </select>
      <select
        value={price}
        onChange={(e) => updateFilter("price", e.target.value)}
        className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
      >
        <option value="">Tất cả giá</option>
        <option value="free">Miễn phí</option>
        <option value="paid">Có phí</option>
      </select>
      {(category || grade || price) && (
        <button
          type="button"
          onClick={() => router.push("/tai-lieu")}
          className="text-sm text-amber-700 hover:underline"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}
