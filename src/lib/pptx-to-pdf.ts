import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const execAsync = promisify(exec);

function findLibreOffice(): string | null {
  const envPath = process.env.LIBREOFFICE_PATH;
  if (envPath && fs.existsSync(envPath)) {
    return envPath;
  }

  const possiblePaths = [
    path.join("C:", "Program Files", "LibreOffice", "program", "soffice.exe"),
    path.join("C:", "Program Files (x86)", "LibreOffice", "program", "soffice.exe"),
    "/usr/bin/libreoffice",
    "/usr/bin/soffice",
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export async function convertPptxToPdf(
  inputPath: string,
  outputDir: string
): Promise<string | null> {
  const soffice = findLibreOffice();
  if (!soffice) {
    console.warn("LibreOffice không tìm thấy. Cài đặt LibreOffice để xem trước PPTX.");
    return null;
  }

  try {
    const inputAbsolute = path.resolve(inputPath);
    const outputAbsolute = path.resolve(outputDir);

    const cmd = `"${soffice}" --headless --convert-to pdf --outdir "${outputAbsolute}" "${inputAbsolute}"`;
    await execAsync(cmd, { timeout: 60000 });

    const baseName = path.basename(inputPath, path.extname(inputPath));
    const pdfPath = path.join(outputAbsolute, `${baseName}.pdf`);

    if (fs.existsSync(pdfPath)) {
      return path.basename(pdfPath);
    }
    return null;
  } catch (e) {
    console.error("Lỗi chuyển đổi PPTX sang PDF:", e);
    return null;
  }
}
