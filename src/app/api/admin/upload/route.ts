import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUploadsDir } from "@/lib/uploads";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const previewFile = formData.get("previewFile") as File | null;
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";
    const price = parseInt((formData.get("price") as string) || "0", 10);
    const category = (formData.get("category") as string) || null;
    const gradeRaw = formData.get("grade") as string | null;
    const grade = gradeRaw ? parseInt(gradeRaw, 10) : null;

    if (!file || !title) {
      return NextResponse.json({ error: "Thiếu file hoặc tên" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "pptx", "zip"].includes(ext ?? "")) {
      return NextResponse.json({ error: "Chỉ chấp nhận PDF, DOCX, PPTX, ZIP" }, { status: 400 });
    }

    const uploadDir = getUploadsDir();
    await mkdir(uploadDir, { recursive: true });

    const fileId = uuidv4();
    const fileName = `${fileId}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    let previewFileUrl: string | null = null;
    if (ext === "pptx" && previewFile && previewFile.size > 0) {
      const previewId = uuidv4();
      const previewFileName = `${previewId}.pdf`;
      const previewPath = path.join(uploadDir, previewFileName);
      const previewBytes = await previewFile.arrayBuffer();
      await writeFile(previewPath, Buffer.from(previewBytes));
      previewFileUrl = previewFileName;
    }

    const validCategory = category && ["giao_an", "de_kiem_tra"].includes(category) ? category : null;
    const validGrade = grade && [6, 7, 8, 9].includes(grade) ? grade : null;

    const document = await prisma.document.create({
      data: {
        title,
        description: description || null,
        fileUrl: fileName,
        fileName: file.name,
        fileType: ext ?? "pdf",
        previewFileUrl,
        price,
        category: validCategory,
        grade: validGrade,
      },
    });

    return NextResponse.json({
      success: true,
      id: document.id,
      hasPreview: !!previewFileUrl,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi tải lên" }, { status: 500 });
  }
}
