import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const purchases = await prisma.purchase.findMany({
    where: { paymentMethod: "bank", status: "pending" },
    include: { document: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(purchases);
}
