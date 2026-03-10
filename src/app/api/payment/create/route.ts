import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3008";

function getVietnamTimeString(d: Date): string {
  const pad = (n: number) => (n < 10 ? "0" + n : String(n));
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .formatToParts(d)
    .reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {} as Record<string, string>);
  return `${parts.year}${parts.month}${parts.day}${parts.hour}${parts.minute}${parts.second}`;
}

function createVNPayUrl(orderId: string, amount: number, documentId: string, clientIp: string) {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const hashSecret = process.env.VNPAY_HASH_SECRET;
  const vnpUrl = process.env.VNPAY_URL;

  if (!tmnCode || !hashSecret || !vnpUrl) {
    return null;
  }

  const now = new Date();
  const createDate = getVietnamTimeString(now);
  const expireDate = getVietnamTimeString(new Date(now.getTime() + 15 * 60 * 1000));
  const ipAddr = clientIp || "127.0.0.1";

  const vnpParams: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Amount: String(amount * 100),
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: `Thanh toan tai lieu ${documentId}`,
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: `${APP_URL}/api/payment/vnpay/callback`,
    vnp_IpnUrl: `${APP_URL}/api/payment/vnpay/ipn`,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  const sortedParams = Object.keys(vnpParams)
    .sort()
    .map((k) => `${k}=${encodeURIComponent(vnpParams[k]!)}`)
    .join("&");

  const signData = sortedParams;
  const hmac = crypto.createHmac("sha512", hashSecret);
  const vnpSecureHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  const url = `${vnpUrl}?${sortedParams}&vnp_SecureHash=${vnpSecureHash}`;
  return url;
}

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

async function createMomoUrl(orderId: string, amount: number, documentId: string) {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const endpoint = process.env.MOMO_ENDPOINT;

  if (!partnerCode || !accessKey || !secretKey || !endpoint) {
    return null;
  }

  const requestId = orderId;
  const lang = "vi";
  const orderInfo = `Thanh toan tai lieu ${documentId}`;
  const redirectUrl = `${APP_URL}/thanh-toan/thanh-cong?orderId=${orderId}&documentId=${documentId}`;
  const ipnUrl = `${APP_URL}/api/payment/momo/ipn`;
  const extraData = Buffer.from(JSON.stringify({ documentId })).toString("base64");

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${encodeURIComponent(ipnUrl)}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${encodeURIComponent(redirectUrl)}&requestId=${requestId}&requestType=captureWallet`;
  const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

  const body = JSON.stringify({
    partnerCode,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    extraData,
    lang,
    signature,
    autoCapture: true,
    requestType: "captureWallet",
  });

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const data = await res.json();
  return data?.payUrl ?? null;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

export async function POST(req: Request) {
  try {
    const { documentId, method, amount, returnUrl } = await req.json();
    const clientIp = getClientIp(req);

    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) {
      return NextResponse.json({ error: "Tài liệu không tồn tại" }, { status: 404 });
    }

    if (document.price === 0) {
      return NextResponse.json({
        url: `${APP_URL}/api/download/${documentId}?free=1`,
      });
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
        paymentMethod: method,
        status: "pending",
      },
    });

    let url: string | null = null;
    if (method === "bank") {
      url = `${APP_URL}/thanh-toan/chuyen-khoan?orderId=${orderId}&documentId=${documentId}`;
    } else if (method === "vnpay") {
      url = createVNPayUrl(orderId, document.price, documentId, clientIp);
    } else if (method === "payos") {
      url = await createPayOSUrl(orderId, document.price, documentId);
    } else if (method === "momo") {
      url = await createMomoUrl(orderId, document.price, documentId);
    }

    if (!url) {
      return NextResponse.json({
        error: "Chưa cấu hình thanh toán. Vui lòng chọn Chuyển khoản hoặc liên hệ quản trị viên.",
      }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
