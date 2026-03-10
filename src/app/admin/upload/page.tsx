import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { UploadForm } from "./UploadForm";

export default async function AdminUploadPage() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    redirect("/admin");
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-amber-900">Tải lên tài liệu</h1>
      <UploadForm />
    </div>
  );
}
