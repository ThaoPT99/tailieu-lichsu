import { NextResponse } from "next/server";
import { verifyAdmin, createAdminSession, ensureAdminExists } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await ensureAdminExists();
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }
    const valid = await verifyAdmin(username, password);
    if (!valid) {
      return NextResponse.json({ error: "Sai tên đăng nhập hoặc mật khẩu" }, { status: 401 });
    }
    await createAdminSession();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
