"use client";

import { useState } from "react";

type Document = {
  id: string;
  title: string;
  price: number;
  fileType: string;
};

export function DownloadSection({ document }: { document: Document }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleDownload = async (method: "vnpay" | "momo" | "bank" | "payos") => {
    if (document.price === 0) {
      window.location.href = `/api/download/${document.id}?free=1`;
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          method,
          amount: document.price,
          returnUrl: typeof window !== "undefined" ? `${window.location.origin}/tai-lieu/${document.id}` : "",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ type: "error", text: data.error ?? "Không thể tạo link thanh toán" });
      }
    } catch {
      setMessage({ type: "error", text: "Có lỗi xảy ra" });
    } finally {
      setLoading(false);
    }
  };

  if (document.price === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-white p-6">
        <h3 className="font-semibold text-amber-900">Tải xuống miễn phí</h3>
        <button
          onClick={() => handleDownload("bank")}
          disabled={loading}
          className="mt-4 rounded-lg bg-amber-600 px-6 py-2 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          Tải xuống
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-white p-6">
      <h3 className="font-semibold text-amber-900">Tải xuống ({document.price.toLocaleString("vi-VN")} ₫)</h3>
      <p className="mt-1 text-sm text-stone-500">
        Chọn phương thức thanh toán để tải xuống
      </p>
      {message && (
        <p className={`mt-2 text-sm ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>
          {message.text}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => handleDownload("payos")}
          disabled={loading}
          className="rounded-lg border-2 border-emerald-600 bg-white px-6 py-2 font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
        >
          PayOS
        </button>
        <button
          onClick={() => handleDownload("bank")}
          disabled={loading}
          className="rounded-lg border-2 border-green-600 bg-white px-6 py-2 font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
        >
          Chuyển khoản
        </button>
        <button
          onClick={() => handleDownload("vnpay")}
          disabled={loading}
          className="rounded-lg border-2 border-blue-600 bg-white px-6 py-2 font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
        >
          VNPay
        </button>
        <button
          onClick={() => handleDownload("momo")}
          disabled={loading}
          className="rounded-lg border-2 border-pink-500 bg-white px-6 py-2 font-medium text-pink-600 hover:bg-pink-50 disabled:opacity-50"
        >
          Momo
        </button>
      </div>
      {loading && <p className="mt-2 text-sm text-stone-500">Đang chuyển hướng...</p>}
    </div>
  );
}
