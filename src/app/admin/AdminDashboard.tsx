"use client";

import { useState, useEffect } from "react";

type Document = {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  price: number;
  createdAt: string;
};

type Purchase = {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  createdAt: string;
  document: { title: string; id: string };
};

export function AdminDashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pendingPurchases, setPendingPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    fetch("/api/admin/documents")
      .then((res) => res.json())
      .then((data) => setDocuments(data));
    fetch("/api/admin/purchases")
      .then((res) => res.json())
      .then((data) => setPendingPurchases(Array.isArray(data) ? data : []))
      .catch(() => setPendingPurchases([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmPayment = async (orderId: string) => {
    const res = await fetch("/api/admin/purchases/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    if (res.ok) loadData();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-900">Quản lý tài liệu</h1>
        <div className="flex gap-3">
          <a
            href="/admin/upload"
            className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700"
          >
            + Tải lên tài liệu
          </a>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-amber-200 px-4 py-2 text-amber-800 hover:bg-amber-50"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {pendingPurchases.length > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/30 p-6">
          <h2 className="mb-4 text-lg font-semibold text-amber-900">
            Đơn chuyển khoản chờ xác nhận
          </h2>
          <div className="space-y-3">
            {pendingPurchases.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-white p-4"
              >
                <div>
                  <p className="font-medium">{p.document.title}</p>
                  <p className="text-sm text-stone-500">
                    Mã: {p.orderId} • {p.amount.toLocaleString("vi-VN")} ₫
                  </p>
                </div>
                <button
                  onClick={() => handleConfirmPayment(p.orderId)}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Xác nhận đã thanh toán
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-stone-500">Đang tải...</p>
      ) : documents.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-12 text-center">
          <p className="text-stone-600">Chưa có tài liệu nào.</p>
          <a
            href="/admin/upload"
            className="mt-4 inline-block text-amber-700 hover:underline"
          >
            Tải lên tài liệu đầu tiên →
          </a>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-amber-100 bg-amber-50/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-amber-900">
                  Tên tài liệu
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-amber-900">
                  Loại
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-amber-900">
                  Giá
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-amber-900">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-amber-50">
                  <td className="px-4 py-3 font-medium">{doc.title}</td>
                  <td className="px-4 py-3 text-stone-500">{doc.fileType.toUpperCase()}</td>
                  <td className="px-4 py-3">
                    {doc.price > 0
                      ? `${doc.price.toLocaleString("vi-VN")} ₫`
                      : "Miễn phí"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/tai-lieu/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 hover:underline"
                    >
                      Xem
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
