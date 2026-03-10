import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUploadsDir } from "@/lib/uploads";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const free = searchParams.get("free") === "1";
  const orderId = searchParams.get("orderId");

  const document = await prisma.document.findUnique({ where: { id } });
  if (!document || !document.fileUrl) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let canDownload = false;
  if (document.price === 0 || free) {
    canDownload = true;
  } else if (orderId) {
    const purchase = await prisma.purchase.findFirst({
      where: { orderId, documentId: id },
    });
    canDownload = purchase?.status === "success";
  }

  if (!canDownload) {
    return NextResponse.json(
      { error: "Bạn cần thanh toán để tải xuống" },
      { status: 403 }
    );
  }

  const filePath = path.join(getUploadsDir(), document.fileUrl);
  if (!fs.existsSync(filePath)) {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Không tìm thấy file</title></head><body style="font-family:system-ui,sans-serif;max-width:480px;margin:80px auto;padding:24px;text-align:center"><h1 style="color:#b45309">File không tìm thấy</h1><p style="color:#666">Tài liệu có thể chưa được tải lên trên server. Vui lòng liên hệ quản trị viên.</p><a href="/" style="color:#b45309;text-decoration:underline">← Về trang chủ</a></body></html>`;
    return new NextResponse(html, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(document.fileName)}"`,
    },
  });
}
