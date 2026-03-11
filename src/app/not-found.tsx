import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-amber-600">404</h1>
      <p className="mt-4 text-xl font-medium text-amber-900">Không tìm thấy trang</p>
      <p className="mt-2 text-stone-600">
        Trang bạn tìm kiếm có thể đã bị xóa hoặc không tồn tại.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-amber-600 px-6 py-3 font-medium text-white hover:bg-amber-700"
      >
        Về trang chủ
      </Link>
      <Link
        href="/tai-lieu"
        className="mt-4 text-amber-700 hover:underline"
      >
        Xem danh sách tài liệu
      </Link>
    </div>
  );
}
