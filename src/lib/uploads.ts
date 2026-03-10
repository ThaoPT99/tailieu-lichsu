import path from "path";

export function getUploadsDir(): string {
  return process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads");
}
