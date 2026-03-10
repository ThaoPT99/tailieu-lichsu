import Link from "next/link";

export default async function ThanhToanThanhCongPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; documentId?: string }>;
}) {
  const { orderId, documentId } = await searchParams;

  if (!documentId) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-amber-900">Thanh toán thành công</h1>
        <p className="mt-2 text-stone-600">Cảm ơn bạn đã thanh toán.</p>
        <Link href="/tai-lieu" className="mt-6 inline-block text-amber-700 hover:underline">
          ← Về danh sách tài liệu
        </Link>
      </div>
    );
  }

  const downloadUrl = `/api/download/${documentId}?orderId=${orderId ?? ""}`;

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
        <p className="text-6xl">✅</p>
        <h1 className="mt-4 text-2xl font-bold text-amber-900">
          Thanh toán thành công!
        </h1>
        <p className="mt-2 text-stone-600">
          Bạn có thể tải xuống tài liệu ngay bây giờ.
        </p>
        <a
          href={downloadUrl}
          className="mt-6 inline-block rounded-lg bg-amber-600 px-6 py-3 font-medium text-white hover:bg-amber-700"
        >
          Tải xuống ngay
        </a>
        <p className="mt-4 text-sm text-stone-500">
          Bạn cũng có thể tải lại từ trang tài liệu bất cứ lúc nào.
        </p>
      </div>
      <Link
        href={`/tai-lieu/${documentId}`}
        className="mt-6 inline-block text-amber-700 hover:underline"
      >
        ← Quay lại trang tài liệu
      </Link>
    </div>
  );
}
