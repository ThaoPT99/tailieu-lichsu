import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUploadsDir } from "@/lib/uploads";
import path from "path";
import fs from "fs";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    return NextResponse.json({ error: "Tài liệu không tồn tại" }, { status: 404 });
  }

  const uploadsDir = getUploadsDir();

  try {
    await prisma.purchase.deleteMany({ where: { documentId: id } });
    await prisma.document.delete({ where: { id } });

    const mainPath = path.join(uploadsDir, document.fileUrl);
    if (fs.existsSync(mainPath)) {
      fs.unlinkSync(mainPath);
    }
    if (document.previewFileUrl) {
      const previewPath = path.join(uploadsDir, document.previewFileUrl);
      if (fs.existsSync(previewPath)) {
        fs.unlinkSync(previewPath);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete document error:", e);
    return NextResponse.json({ error: "Không thể xóa tài liệu" }, { status: 500 });
  }
}
