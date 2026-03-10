import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await req.json();
  if (!orderId) {
    return NextResponse.json({ error: "Thiếu orderId" }, { status: 400 });
  }

  const updated = await prisma.purchase.updateMany({
    where: { orderId, paymentMethod: "bank", status: "pending" },
    data: { status: "success", completedAt: new Date() },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Đơn không tồn tại hoặc đã xác nhận" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
