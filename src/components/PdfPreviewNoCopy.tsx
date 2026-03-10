"use client";

import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

type Props = {
  url: string;
  className?: string;
};

export function PdfPreviewNoCopy({ url, className = "" }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const loadingTask = pdfjsLib.getDocument({ url });
    loadingTask.promise
      .then((pdf) => {
        if (cancelled) return;
        setLoading(false);
        const renderNext = (i: number) => {
          if (cancelled || i > pdf.numPages) return;
          const container = containerRef.current;
          if (!container) return;
          pdf.getPage(i).then((page) => {
            if (cancelled) return;
            const scale = 1.5;
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement("canvas");
            canvas.style.display = "block";
            canvas.style.marginBottom = "16px";
            canvas.style.maxWidth = "100%";
            canvas.style.height = "auto";
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              renderNext(i + 1);
              return;
            }
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            page.render({
              canvasContext: ctx,
              viewport,
              canvas,
            }).promise.then(() => {
              if (cancelled) return;
              container.appendChild(canvas);
              renderNext(i + 1);
            });
          });
        };
        const container = containerRef.current;
        if (container) container.innerHTML = "";
        renderNext(1);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Không thể tải PDF");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (error) {
    return <p className="text-amber-700">{error}</p>;
  }

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {loading && <p className="shrink-0 text-stone-500">Đang tải xem trước...</p>}
      <div
        ref={containerRef}
        className="min-h-0 flex-1 select-none overflow-y-auto"
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
