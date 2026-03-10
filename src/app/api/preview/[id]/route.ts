import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUploadsDir } from "@/lib/uploads";
import path from "path";
import fs from "fs";
import mammoth from "mammoth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document || !document.fileUrl) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (document.fileUrl.includes("..") || document.fileUrl.includes("/") || document.fileUrl.includes("\\")) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  const uploadsDir = getUploadsDir();
  const filePath = path.join(uploadsDir, document.fileUrl);

  if (!fs.existsSync(uploadsDir)) {
    console.error("Preview file not found:", filePath);
    return NextResponse.json(
      { error: "File không tồn tại. Vui lòng tải lên lại tài liệu." },
      { status: 404 }
    );
  }

  if (document.fileType === "pdf") {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File không tồn tại. Vui lòng tải lên lại tài liệu." },
        { status: 404 }
      );
    }
    const buffer = fs.readFileSync(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
      },
    });
  }

  if (document.fileType === "docx") {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File không tồn tại. Vui lòng tải lên lại tài liệu." },
        { status: 404 }
      );
    }
    try {
      const buffer = fs.readFileSync(filePath);
      const result = await mammoth.convertToHtml({ buffer });
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:2rem;line-height:1.6;}</style></head><body>${result.value}</body></html>`;
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } catch (e) {
      console.error("DOCX convert error:", e);
      return NextResponse.json(
        { error: "Không thể chuyển đổi file DOCX để xem trước" },
        { status: 500 }
      );
    }
  }

  if (document.fileType === "pptx" && document.previewFileUrl && !document.previewFileUrl.includes("..")) {
    const previewPath = path.join(uploadsDir, document.previewFileUrl);
    if (!document.previewFileUrl.includes("..") && fs.existsSync(previewPath)) {
      const buffer = fs.readFileSync(previewPath);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline",
        },
      });
    }
  }

  return NextResponse.json({ error: "Preview not available" }, { status: 400 });
}
