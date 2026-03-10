"use client";

import { useState } from "react";

export function UploadForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPptx, setIsPptx] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setIsPptx(file?.name.toLowerCase().endsWith(".pptx") ?? false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";
    const price = parseInt((formData.get("price") as string) || "0", 10);
    const file = formData.get("file") as File;
    const previewFile = formData.get("previewFile") as File | null;

    if (!title || !file || file.size === 0) {
      setMessage({ type: "error", text: "Vui lòng điền tên và chọn file" });
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "pptx"].includes(ext ?? "")) {
      setMessage({ type: "error", text: "Chỉ chấp nhận file PDF, DOCX, PPTX" });
      return;
    }

    if (ext === "pptx" && previewFile && previewFile.size > 0 && !previewFile.name.toLowerCase().endsWith(".pdf")) {
      setMessage({ type: "error", text: "File xem trước phải là PDF" });
      return;
    }

    setLoading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("title", title);
      uploadData.append("description", description);
      uploadData.append("price", String(price));
      if (previewFile && previewFile.size > 0) {
        uploadData.append("previewFile", previewFile);
      }

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadData,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Tải lên thành công!" });
        form.reset();
        setIsPptx(false);
      } else {
        setMessage({ type: "error", text: data.error ?? "Tải lên thất bại" });
      }
    } catch {
      setMessage({ type: "error", text: "Có lỗi xảy ra" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-amber-200 bg-white p-6">
      <div>
        <label className="block text-sm font-medium text-stone-700">Tên tài liệu *</label>
        <input
          type="text"
          name="title"
          required
          className="mt-1 w-full rounded-lg border border-amber-200 px-4 py-2"
          placeholder="VD: Giáo án Lịch sử 6 - Bài 1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700">Mô tả (tùy chọn)</label>
        <textarea
          name="description"
          rows={3}
          className="mt-1 w-full rounded-lg border border-amber-200 px-4 py-2"
          placeholder="Mô tả ngắn về tài liệu..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700">Giá (VNĐ) - 0 = miễn phí</label>
        <input
          type="number"
          name="price"
          min={0}
          defaultValue={0}
          className="mt-1 w-full rounded-lg border border-amber-200 px-4 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700">File (PDF, DOCX, PPTX) *</label>
        <input
          type="file"
          name="file"
          accept=".pdf,.docx,.pptx"
          required
          onChange={handleFileChange}
          className="mt-1 w-full"
        />
      </div>
      {isPptx && (
        <div>
          <label className="block text-sm font-medium text-stone-700">
            File PDF xem trước (tùy chọn)
          </label>
          <p className="mt-0.5 text-xs text-stone-500">
            Nếu muốn, tải lên bản PDF của slide để khách hàng xem trước. Không tải thì khách vẫn mua và tải file PPTX về.
          </p>
          <input
            type="file"
            name="previewFile"
            accept=".pdf"
            className="mt-1 w-full"
          />
        </div>
      )}
      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-600 px-6 py-2 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? "Đang tải..." : "Tải lên"}
        </button>
        <a
          href="/admin"
          className="rounded-lg border border-amber-200 px-6 py-2 font-medium text-amber-800 hover:bg-amber-50"
        >
          Quay lại
        </a>
      </div>
    </form>
  );
}
