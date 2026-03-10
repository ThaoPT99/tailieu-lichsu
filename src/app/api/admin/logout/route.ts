import { NextResponse } from "next/server";
import { deleteAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await deleteAdminSession();
  return NextResponse.json({ success: true });
}
