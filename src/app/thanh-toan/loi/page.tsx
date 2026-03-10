import Link from "next/link";

export default function ThanhToanLoiPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
        <p className="text-6xl">❌</p>
        <h1 className="mt-4 text-2xl font-bold text-amber-900">
          Thanh toán thất bại
        </h1>
        <p className="mt-2 text-stone-600">
          Đã có lỗi xảy ra. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
        </p>
      </div>
      <Link
        href="/tai-lieu"
        className="mt-6 inline-block text-amber-700 hover:underline"
      >
        ← Về danh sách tài liệu
      </Link>
    </div>
  );
}
