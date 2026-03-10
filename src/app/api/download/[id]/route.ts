import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const free = searchParams.get("free") === "1";
  const orderId = searchParams.get("orderId");

  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

  const filePath = path.join(process.cwd(), "uploads", document.fileUrl);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(document.fileName)}"`,
    },
  });
}
