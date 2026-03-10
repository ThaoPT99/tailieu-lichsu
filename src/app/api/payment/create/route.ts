import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3008";

async function createPayOSUrl(orderId: string, amount: number, documentId: string) {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

  if (!clientId || !apiKey || !checksumKey) return null;

  const orderCode = parseInt(orderId.replace("TL", "").split("-")[0] || "0", 10);
  const description = `TL ${String(orderCode).slice(-6)}`;
  const returnUrl = `${APP_URL}/thanh-toan/thanh-cong?orderId=${orderId}&documentId=${documentId}`;
  const cancelUrl = `${APP_URL}/tai-lieu/${documentId}`;

  const dataStr = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
  const signature = crypto
    .createHmac("sha256", checksumKey)
    .update(dataStr)
    .digest("hex");

  const body = JSON.stringify({
    orderCode,
    amount,
    description,
    cancelUrl,
    returnUrl,
    items: [{ name: "Tai lieu", quantity: 1, price: amount }],
    signature,
  });

  const res = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": clientId,
      "x-api-key": apiKey,
    },
    body,
  });
  const data = await res.json();
  return data?.data?.checkoutUrl ?? null;
}

export async function POST(req: Request) {
  try {
    const { documentId, method, amount } = await req.json();

    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) {
      return NextResponse.json({ error: "Tài liệu không tồn tại" }, { status: 404 });
    }

    if (document.price === 0) {
      return NextResponse.json({
        url: `${APP_URL}/api/download/${documentId}?free=1`,
      });
    }

    if (method !== "payos") {
      return NextResponse.json({ error: "Chỉ hỗ trợ thanh toán PayOS" }, { status: 400 });
    }

    if (amount !== document.price) {
      return NextResponse.json({ error: "Số tiền không hợp lệ" }, { status: 400 });
    }

    const orderId = `TL${Date.now()}-${uuidv4().slice(0, 8)}`;

    await prisma.purchase.create({
      data: {
        documentId,
        orderId,
        amount: document.price,
        paymentMethod: "payos",
        status: "pending",
      },
    });

    const url = await createPayOSUrl(orderId, document.price, documentId);

    if (!url) {
      return NextResponse.json({
        error: "Chưa cấu hình PayOS. Vui lòng liên hệ quản trị viên.",
      }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
