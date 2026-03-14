"use client";

import { useState } from "react";
import { DOC_CATEGORIES, DOC_GRADES } from "@/lib/doc-types";

export function UploadForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPreviewOption, setShowPreviewOption] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const ext = file?.name.toLowerCase().split(".").pop();
    setShowPreviewOption(ext === "pptx" || ext === "zip");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";
    const price = parseInt((formData.get("price") as string) || "0", 10);
    const category = formData.get("category") as string;
    const grade = formData.get("grade") as string;
    const file = formData.get("file") as File;
    const previewFile = formData.get("previewFile") as File | null;

    if (!title || !file || file.size === 0) {
      setMessage({ type: "error", text: "Vui lòng điền tên và chọn file" });
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "pptx", "zip"].includes(ext ?? "")) {
      setMessage({ type: "error", text: "Chỉ chấp nhận file PDF, DOCX, PPTX, ZIP" });
      return;
    }

    if ((ext === "pptx" || ext === "zip") && previewFile && previewFile.size > 0 && !previewFile.name.toLowerCase().endsWith(".pdf")) {
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
      if (category) uploadData.append("category", category);
      if (grade) uploadData.append("grade", grade);
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
        setShowPreviewOption(false);
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-stone-700">Loại tài liệu</label>
          <select
            name="category"
            className="mt-1 w-full rounded-lg border border-amber-200 px-4 py-2"
          >
            <option value="">— Chọn loại —</option>
            {DOC_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">Lớp</label>
          <select
            name="grade"
            className="mt-1 w-full rounded-lg border border-amber-200 px-4 py-2"
          >
            <option value="">— Chọn lớp —</option>
            {DOC_GRADES.map((g) => (
              <option key={g} value={g}>
                Lớp {g}
              </option>
            ))}
          </select>
        </div>
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
        <label className="block text-sm font-medium text-stone-700">File (PDF, DOCX, PPTX, ZIP) *</label>
        <input
          type="file"
          name="file"
          accept=".pdf,.docx,.pptx,.zip"
          required
          onChange={handleFileChange}
          className="mt-1 w-full"
        />
      </div>
      {showPreviewOption && (
        <div>
          <label className="block text-sm font-medium text-stone-700">
            File PDF xem trước (tùy chọn)
          </label>
          <p className="mt-0.5 text-xs text-stone-500">
            Tải lên file PDF để khách hàng xem trước (vd: PDF tóm tắt nội dung ZIP, hoặc bản PDF của slide PPTX). Không tải thì khách vẫn mua và tải file gốc về.
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
