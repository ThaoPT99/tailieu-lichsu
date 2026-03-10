"use client";

import { useState } from "react";

type Document = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number | null;
  fileType: string;
};

export function DownloadSection({ document }: { document: Document }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleDownload = async () => {
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
          method: "payos",
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
          onClick={handleDownload}
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
      <h3 className="font-semibold text-amber-900">
        Tải xuống{" "}
        {document.originalPrice != null && document.originalPrice > document.price ? (
          <span>
            <span className="line-through text-stone-400">
              {document.originalPrice.toLocaleString("vi-VN")} ₫
            </span>{" "}
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-sm font-medium text-red-700">
              -{Math.round((1 - document.price / document.originalPrice) * 100)}%
            </span>{" "}
            {document.price.toLocaleString("vi-VN")} ₫
          </span>
        ) : (
          `(${document.price.toLocaleString("vi-VN")} ₫)`
        )}
      </h3>
      <p className="mt-1 text-sm text-stone-500">
        Thanh toán qua PayOS để tải xuống
      </p>
      {message && (
        <p className={`mt-2 text-sm ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>
          {message.text}
        </p>
      )}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="mt-4 rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        Thanh toán PayOS
      </button>
      {loading && <p className="mt-2 text-sm text-stone-500">Đang chuyển hướng...</p>}
    </div>
  );
}
