"use client";

import { useState, useEffect } from "react";

type Document = {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileType: string;
  price: number;
  originalPrice: number | null;
  createdAt: string;
};

export function AdminDashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Document | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", price: 0, originalPrice: "" });

  const loadData = () => {
    fetch("/api/admin/documents")
      .then((res) => res.json())
      .then((data) => setDocuments(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEdit = (doc: Document) => {
    setEditing(doc);
    setEditForm({
      title: doc.title,
      description: doc.description ?? "",
      price: doc.price,
      originalPrice: doc.originalPrice != null ? String(doc.originalPrice) : "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    const res = await fetch(`/api/admin/documents/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editForm.title,
        description: editForm.description || null,
        price: editForm.price,
        originalPrice: editForm.originalPrice ? parseInt(editForm.originalPrice, 10) : null,
      }),
    });
    if (res.ok) {
      setEditing(null);
      loadData();
    }
  };

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
                    {doc.price > 0 ? (
                      <span>
                        {doc.originalPrice != null && doc.originalPrice > doc.price && (
                          <span className="text-stone-400 line-through mr-1">
                            {doc.originalPrice.toLocaleString("vi-VN")} ₫
                          </span>
                        )}
                        {doc.price.toLocaleString("vi-VN")} ₫
                        {doc.originalPrice != null && doc.originalPrice > doc.price && (
                          <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                            -{Math.round((1 - doc.price / doc.originalPrice) * 100)}%
                          </span>
                        )}
                      </span>
                    ) : (
                      "Miễn phí"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(doc)}
                      className="mr-3 text-amber-700 hover:underline"
                    >
                      Sửa
                    </button>
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

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-amber-900">Chỉnh sửa tài liệu</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Tên *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-amber-200 px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Mô tả</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-amber-200 px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Giá gốc (VNĐ)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Bỏ trống = không hiển thị sale"
                  value={editForm.originalPrice}
                  onChange={(e) => setEditForm((f) => ({ ...f, originalPrice: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-amber-200 px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Giá bán hiện tại (VNĐ) *</label>
                <input
                  type="number"
                  min={0}
                  value={editForm.price}
                  onChange={(e) => setEditForm((f) => ({ ...f, price: parseInt(e.target.value, 10) || 0 }))}
                  className="mt-1 w-full rounded-lg border border-amber-200 px-4 py-2"
                />
                <p className="mt-1 text-xs text-stone-500">
                  Nếu có giá gốc và giá bán &lt; giá gốc → tự hiển thị % giảm
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-amber-200 px-4 py-2 text-amber-800 hover:bg-amber-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
