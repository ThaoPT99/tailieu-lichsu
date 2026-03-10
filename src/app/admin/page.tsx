import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";

export default async function AdminPage() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return <AdminLogin />;
  }
  return <AdminDashboard />;
}
