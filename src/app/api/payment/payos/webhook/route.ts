import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function verifyPayOSWebhook(data: Record<string, unknown>, signature: string): boolean {
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!checksumKey) return false;

  const sorted = Object.keys(data)
    .sort()
    .reduce((acc, k) => {
      acc[k] = data[k];
      return acc;
    }, {} as Record<string, unknown>);

  const str = Object.keys(sorted)
    .map((k) => {
      let v = sorted[k];
      if (v === undefined || v === null || v === "undefined" || v === "null")
        v = "";
      if (Array.isArray(v))
        v = JSON.stringify(v.map((item) => (typeof item === "object" && item ? Object.keys(item).sort().reduce((o: Record<string, unknown>, key) => {
          o[key] = (item as Record<string, unknown>)[key];
          return o;
        }, {}) : item)));
      if (typeof v === "object" && v !== null && !Array.isArray(v))
        v = JSON.stringify(v);
      return `${k}=${v}`;
    })
    .join("&");

  const expected = crypto
    .createHmac("sha256", checksumKey)
    .update(str)
    .digest("hex");
  return expected === signature;
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = body.signature as string;
    const data = body.data as Record<string, unknown>;
    if (!signature || !data || !verifyPayOSWebhook(data, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (!body.success || body.code !== "00") {
      return NextResponse.json({ received: true });
    }

    const orderCode = body.data?.orderCode;
    if (!orderCode) return NextResponse.json({ received: true });

    const orderIdPrefix = `TL${orderCode}-`;
    const updated = await prisma.purchase.updateMany({
      where: {
        orderId: { startsWith: orderIdPrefix },
        paymentMethod: "payos",
        status: "pending",
      },
      data: { status: "success", completedAt: new Date() },
    });

    if (updated.count > 0) {
      console.log("PayOS webhook: confirmed order", orderIdPrefix);
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("PayOS webhook error:", e);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
