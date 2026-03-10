"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const PdfPreviewNoCopy = dynamic(
  () => import("@/components/PdfPreviewNoCopy").then((m) => m.PdfPreviewNoCopy),
  { ssr: false }
);

type Document = {
  id: string;
  fileType: string;
  fileUrl: string;
  previewFileUrl?: string | null;
};

export function DocumentView({ document }: { document: Document }) {
  const [content, setContent] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (document.fileType === "pdf") {
      fetch(`/api/preview/${document.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Không tải được file");
          return res.blob();
        })
        .then((blob) => {
          objectUrl = URL.createObjectURL(blob);
          setPdfUrl(objectUrl);
          setLoading(false);
        })
        .catch(() => {
          setError("Không thể tải xem trước PDF");
          setLoading(false);
        });
      return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }
    if (document.fileType === "docx") {
      fetch(`/api/preview/${document.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Không tải được file");
          return res.text();
        })
        .then((html) => {
          setContent(html);
          setLoading(false);
        })
        .catch(() => {
          setError("Không thể tải xem trước");
          setLoading(false);
        });
    } else if (document.fileType === "pptx") {
      let pptxObjectUrl: string | null = null;
      fetch(`/api/preview/${document.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Không tải được file");
          return res.blob();
        })
        .then((blob) => {
          pptxObjectUrl = URL.createObjectURL(blob);
          setPdfUrl(pptxObjectUrl);
          setLoading(false);
        })
        .catch(() => {
          setError("Không có xem trước. Vui lòng thanh toán để tải xuống file PPTX gốc.");
          setLoading(false);
        });
      return () => {
        if (pptxObjectUrl) URL.revokeObjectURL(pptxObjectUrl);
      };
    } else {
      setLoading(false);
    }
  }, [document.id, document.fileType]);

  if (document.fileType === "pdf") {
    if (loading) {
      return (
        <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center">
          <p className="text-stone-500">Đang tải xem trước PDF...</p>
        </div>
      );
    }
    if (error || !pdfUrl) {
      return (
        <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center">
          <p className="text-amber-700">{error ?? "Không thể tải xem trước"}</p>
          <a
            href={`/api/preview/${document.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-amber-600 hover:underline"
          >
            Mở trong tab mới →
          </a>
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-amber-200 bg-white p-4">
        <h3 className="mb-4 font-semibold text-amber-900">Xem trước</h3>
        <div className="h-[600px] overflow-hidden rounded-lg border [user-select:none] [-webkit-user-select:none]">
          <PdfPreviewNoCopy url={pdfUrl} className="h-full" />
        </div>
      </div>
    );
  }

  if (document.fileType === "docx") {
    if (loading) {
      return (
        <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center">
          <p className="text-stone-500">Đang tải xem trước...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center">
          <p className="text-amber-700">{error}</p>
          <p className="mt-2 text-sm text-stone-500">
            Bạn có thể mua để tải xuống file gốc
          </p>
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-amber-200 bg-white p-4">
        <h3 className="mb-4 font-semibold text-amber-900">Xem trước</h3>
        <div
          className="prose prose-stone max-h-[600px] select-none overflow-y-auto rounded-lg border p-6"
          style={{ userSelect: "none", WebkitUserSelect: "none" }}
          onContextMenu={(e) => e.preventDefault()}
          dangerouslySetInnerHTML={{ __html: content ?? "" }}
        />
      </div>
    );
  }

  if (document.fileType === "pptx") {
    if (loading) {
      return (
        <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center">
          <p className="text-stone-500">Đang tải xem trước...</p>
        </div>
      );
    }
    if (pdfUrl) {
      return (
        <div className="rounded-2xl border border-amber-200 bg-white p-4">
          <h3 className="mb-4 font-semibold text-amber-900">
            Xem trước (bản PDF) • Tải xuống nhận file PPTX gốc
          </h3>
          <div className="h-[600px] overflow-hidden rounded-lg border [user-select:none] [-webkit-user-select:none]">
            <PdfPreviewNoCopy url={pdfUrl} className="h-full" />
          </div>
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center">
        <p className="text-6xl">📊</p>
        <h3 className="mt-4 font-semibold text-amber-900">File PowerPoint</h3>
        <p className="mt-2 text-stone-600">
          {error ?? "Xem trước không khả dụng. Vui lòng thanh toán để tải xuống file PPTX gốc."}
        </p>
      </div>
    );
  }

  return null;
}
