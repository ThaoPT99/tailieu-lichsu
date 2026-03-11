"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DOC_CATEGORIES, DOC_GRADES } from "@/lib/doc-types";

type DocFiltersProps = {
  basePath?: string;
  showSearch?: boolean;
};

export function DocFilters({ basePath = "/tai-lieu", showSearch = true }: DocFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const grade = searchParams.get("grade") ?? "";
  const price = searchParams.get("price") ?? "";
  const q = searchParams.get("q") ?? "";

  const buildUrl = (params: URLSearchParams) => {
    const s = params.toString();
    if (basePath === "/") return s ? `/?${s}` : "/";
    return `${basePath}${s ? `?${s}` : ""}`;
  };

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "q") params.delete("page");
    router.push(buildUrl(params));
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector<HTMLInputElement>('input[name="q"]');
    const value = input?.value?.trim() ?? "";
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value);
    else params.delete("q");
    params.delete("page");
    router.push(buildUrl(params));
  };

  const hasFilters = category || grade || price || q;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
      {showSearch && (
        <form onSubmit={handleSearch} className="flex min-w-[200px] max-w-xs flex-1">
          <input
            key={`q-${q}`}
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Tìm theo tên, mô tả..."
            className="w-full rounded-l-lg border border-amber-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          <button
            type="submit"
            className="rounded-r-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Tìm
          </button>
        </form>
      )}
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
      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push(buildUrl(new URLSearchParams()))}
          className="text-sm text-amber-700 hover:underline"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}
