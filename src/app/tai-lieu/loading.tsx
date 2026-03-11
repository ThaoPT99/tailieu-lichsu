import { DocListSkeleton } from "@/components/DocListSkeleton";

export default function TaiLieuLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-4 h-9 w-64 animate-pulse rounded bg-amber-100" />
      <div className="mb-6 h-14 animate-pulse rounded-xl bg-amber-50" />
      <DocListSkeleton count={12} />
      <div className="mt-8 flex justify-center gap-2">
        <div className="h-10 w-24 animate-pulse rounded-lg bg-amber-100" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-amber-100" />
      </div>
    </div>
  );
}
