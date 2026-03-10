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

export function AdminDashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    fetch("/api/admin/documents")
      .then((res) => res.json())
      .then((data) => setDocuments(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (docId: string, title: string) => {
    if (!confirm(`Xóa tài liệu "${title}"? Hành động không thể hoàn tác.`)) return;
    const res = await fetch(`/api/admin/documents/${docId}`, { method: "DELETE" });
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
                      className="mr-3 text-amber-700 hover:underline"
                    >
                      Xem
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      className="text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
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
