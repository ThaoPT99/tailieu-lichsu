import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, resultCode } = body;

    if (resultCode === 0 && orderId) {
      await prisma.purchase.updateMany({
        where: { orderId },
        data: { status: "success", completedAt: new Date() },
      });
    }

    return NextResponse.json({ resultCode: 0, message: "OK" });
  } catch {
    return NextResponse.json({ resultCode: 97, message: "Unknown" }, { status: 500 });
  }
}
