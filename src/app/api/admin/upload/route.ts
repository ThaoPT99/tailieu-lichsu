import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUploadsDir } from "@/lib/uploads";
import { mkdir } from "fs/promises";
import { createWriteStream } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import Busboy from "busboy";
import { Readable } from "stream";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ParsedUpload = {
  fields: Record<string, string>;
  file: { originalName: string; storedName: string; ext: string } | null;
  previewFile: { originalName: string; storedName: string; ext: string } | null;
};

const ALLOWED_EXTS = new Set(["pdf", "docx", "pptx", "zip"]);
const DEFAULT_MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50MB

function getMaxUploadBytes(): number {
  const raw = process.env.MAX_UPLOAD_BYTES ?? "";
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_MAX_UPLOAD_BYTES;
  return Math.floor(n);
}

async function parseMultipartToDisk(req: Request, uploadDir: string): Promise<ParsedUpload> {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    throw new Error("INVALID_CONTENT_TYPE");
  }

  const maxBytes = getMaxUploadBytes();
  const bb = Busboy({
    headers: Object.fromEntries(req.headers.entries()),
    limits: {
      files: 2,
      fields: 10,
      fileSize: maxBytes,
    },
  });

  const parsed: ParsedUpload = { fields: {}, file: null, previewFile: null };
  const writes: Promise<void>[] = [];
  let fileTooLarge = false;

  bb.on("field", (name, value) => {
    parsed.fields[name] = value;
  });

  bb.on("file", (fieldName, fileStream, info) => {
    const originalName = info.filename ?? "";
    const ext = originalName.split(".").pop()?.toLowerCase() ?? "";

    if ((fieldName !== "file" && fieldName !== "previewFile") || !originalName) {
      fileStream.resume();
      return;
    }

    if (fieldName === "previewFile" && ext !== "pdf") {
      fileStream.resume();
      return;
    }

    if (fieldName === "file" && !ALLOWED_EXTS.has(ext)) {
      fileStream.resume();
      return;
    }

    const id = uuidv4();
    const storedName = `${id}.${ext}`;
    const outPath = path.join(uploadDir, storedName);
    const out = createWriteStream(outPath, { flags: "wx" });

    fileStream.on("limit", () => {
      fileTooLarge = true;
      out.destroy(new Error("FILE_TOO_LARGE"));
      fileStream.unpipe(out);
      fileStream.resume();
    });

    const done = new Promise<void>((resolve, reject) => {
      out.on("error", reject);
      out.on("close", () => resolve());
    });

    fileStream.pipe(out);
    writes.push(done);

    if (fieldName === "file") {
      parsed.file = { originalName, storedName, ext };
    } else {
      parsed.previewFile = { originalName, storedName, ext };
    }
  });

  const finished = new Promise<void>((resolve, reject) => {
    bb.on("finish", resolve);
    bb.on("error", reject);
  });

  const body = req.body;
  if (!body) throw new Error("MISSING_BODY");

  Readable.fromWeb(body as unknown as ReadableStream).pipe(bb);
  await finished;
  await Promise.all(writes);

  if (fileTooLarge) throw new Error("FILE_TOO_LARGE");
  return parsed;
}

export async function POST(req: Request) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const uploadDir = getUploadsDir();
    await mkdir(uploadDir, { recursive: true });

    const { fields, file, previewFile } = await parseMultipartToDisk(req, uploadDir);

    const title = (fields.title ?? "").trim();
    const description = (fields.description ?? "").trim();
    const price = Number.parseInt(fields.price ?? "0", 10) || 0;
    const category = (fields.category ?? "").trim() || null;
    const grade = fields.grade ? Number.parseInt(fields.grade, 10) : null;

    if (!file || !title) {
      return NextResponse.json({ error: "Thiếu file hoặc tên" }, { status: 400 });
    }

    const ext = file.ext;
    let previewFileUrl: string | null = null;
    if ((ext === "pptx" || ext === "zip") && previewFile) {
      previewFileUrl = previewFile.storedName;
    }

    const validCategory = category && ["giao_an", "de_kiem_tra"].includes(category) ? category : null;
    const validGrade = grade && [6, 7, 8, 9].includes(grade) ? grade : null;

    const document = await prisma.document.create({
      data: {
        title,
        description: description || null,
        fileUrl: file.storedName,
        fileName: file.originalName,
        fileType: ext,
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
    if (e instanceof Error && e.message === "FILE_TOO_LARGE") {
      return NextResponse.json(
        { error: `File quá lớn. Giới hạn hiện tại: ${Math.floor(getMaxUploadBytes() / (1024 * 1024))}MB` },
        { status: 413 },
      );
    }
    if (e instanceof Error && e.message === "INVALID_CONTENT_TYPE") {
      return NextResponse.json({ error: "Content-Type không hợp lệ" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Lỗi tải lên" }, { status: 500 });
  }
}
