import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-amber-200/50 bg-amber-50/95 backdrop-blur supports-[backdrop-filter]:bg-amber-50/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-amber-900">
          <span className="text-2xl">📚</span>
          <span>Tài Liệu Lịch Sử</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/tai-lieu"
            className="text-sm font-medium text-amber-800 hover:text-amber-600"
          >
            Danh sách tài liệu
          </Link>
        </nav>
      </div>
    </header>
  );
}
