import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

export default async function ChuyenKhoanPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; documentId?: string }>;
}) {
  const { orderId, documentId } = await searchParams;
  if (!orderId || !documentId) {
    redirect("/");
  }

  const purchase = await prisma.purchase.findFirst({
    where: { orderId, documentId },
    include: { document: true },
  });

  if (!purchase || purchase.status === "success") {
    redirect("/");
  }

  const bankName = process.env.BANK_NAME ?? "Ngân hàng TMCP Vietcombank";
  const bankNumber = process.env.BANK_ACCOUNT_NUMBER ?? "Chưa cấu hình";
  const bankBranch = process.env.BANK_BRANCH ?? "";
  const recipientName = process.env.BANK_RECIPIENT_NAME ?? "Chưa cấu hình";
  const contactInfo = process.env.CONTACT_INFO ?? "Liên hệ quản trị viên";

  const downloadUrl = `${APP_URL}/api/download/${documentId}?orderId=${orderId}`;

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-bold text-amber-900">
          Hướng dẫn chuyển khoản
        </h1>

        <div className="mb-6 space-y-2 rounded-lg bg-amber-50 p-4">
          <p className="font-medium text-amber-900">{purchase.document.title}</p>
          <p className="text-lg font-bold text-amber-700">
            {purchase.amount.toLocaleString("vi-VN")} ₫
          </p>
        </div>

        <div className="mb-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">Ngân hàng:</span>
            <span className="font-medium">{bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Số tài khoản:</span>
            <span className="font-mono font-medium">{bankNumber}</span>
          </div>
          {bankBranch && (
            <div className="flex justify-between">
              <span className="text-stone-500">Chi nhánh:</span>
              <span>{bankBranch}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-stone-500">Chủ tài khoản:</span>
            <span className="font-medium">{recipientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Nội dung chuyển khoản:</span>
            <span className="rounded bg-amber-100 px-2 py-1 font-mono font-bold text-amber-900">
              {orderId}
            </span>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-sm text-stone-600">
          <p className="font-medium text-amber-900">Lưu ý:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Chuyển đúng số tiền {purchase.amount.toLocaleString("vi-VN")} ₫</li>
            <li>Ghi chính xác nội dung: <strong>{orderId}</strong></li>
            <li>Sau khi chuyển, admin sẽ xác nhận (thường trong 24h)</li>
            <li>Link tải sẽ kích hoạt sau khi được xác nhận</li>
          </ul>
        </div>

        <div className="mb-6 rounded-lg bg-stone-100 p-4">
          <p className="mb-2 text-sm font-medium text-stone-700">
            Link tải (kích hoạt sau khi xác nhận):
          </p>
          <a
            href={downloadUrl}
            className="break-all text-sm text-amber-700 hover:underline"
          >
            {downloadUrl}
          </a>
        </div>

        <p className="mb-6 text-sm text-stone-500">
          Liên hệ: {contactInfo}
        </p>

        <Link
          href={`/tai-lieu/${documentId}`}
          className="inline-block rounded-lg bg-amber-600 px-6 py-2 font-medium text-white hover:bg-amber-700"
        >
          ← Quay lại tài liệu
        </Link>
      </div>
    </div>
  );
}
