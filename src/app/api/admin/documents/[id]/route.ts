import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUploadsDir } from "@/lib/uploads";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
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

  try {
    const body = await req.json();
    const data: {
      title?: string;
      description?: string | null;
      price?: number;
      originalPrice?: number | null;
      category?: string | null;
      grade?: number | null;
    } = {};

    if (typeof body.title === "string" && body.title.trim()) {
      data.title = body.title.trim();
    }
    if (body.description !== undefined) {
      data.description = body.description && String(body.description).trim() ? String(body.description).trim() : null;
    }
    if (typeof body.price === "number" && body.price >= 0) {
      data.price = Math.round(body.price);
    }
    if (body.originalPrice !== undefined) {
      if (body.originalPrice === null || body.originalPrice === "") {
        data.originalPrice = null;
      } else {
        const n = typeof body.originalPrice === "number" ? body.originalPrice : parseInt(String(body.originalPrice), 10);
        data.originalPrice = !isNaN(n) && n >= 0 ? n : null;
      }
    }
    if (body.category !== undefined) {
      data.category = ["giao_an", "de_kiem_tra"].includes(body.category) ? body.category : null;
    }
    if (body.grade !== undefined) {
      const g = typeof body.grade === "number" ? body.grade : parseInt(String(body.grade), 10);
      data.grade = g && [6, 7, 8, 9].includes(g) ? g : null;
    }

    await prisma.document.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Update document error:", e);
    return NextResponse.json({ error: "Không thể cập nhật" }, { status: 500 });
  }
}

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

    const mainPath = document.fileUrl ? path.join(uploadsDir, document.fileUrl) : null;
    if (mainPath && fs.existsSync(mainPath)) {
      fs.unlinkSync(mainPath);
    }
    if (document.previewFileUrl && !document.previewFileUrl.includes("..")) {
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
