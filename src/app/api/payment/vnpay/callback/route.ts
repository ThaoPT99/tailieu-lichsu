import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3008";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const vnpParams = Object.fromEntries(searchParams.entries());
  const vnpSecureHash = vnpParams["vnp_SecureHash"];
  delete vnpParams["vnp_SecureHash"];
  delete vnpParams["vnp_SecureHashType"];

  const hashSecret = process.env.VNPAY_HASH_SECRET;
  if (!hashSecret) {
    return NextResponse.redirect(`${APP_URL}/thanh-toan/loi`);
  }

  const sortedParams = Object.keys(vnpParams)
    .sort()
    .filter((k) => vnpParams[k])
    .map((k) => `${k}=${encodeURIComponent(vnpParams[k]!)}`)
    .join("&");

  const hmac = crypto.createHmac("sha512", hashSecret);
  const computedHash = hmac.update(Buffer.from(sortedParams, "utf-8")).digest("hex");

  if (computedHash !== vnpSecureHash) {
    return NextResponse.redirect(`${APP_URL}/thanh-toan/loi`);
  }

  const vnpResponseCode = vnpParams["vnp_ResponseCode"];
  const orderId = vnpParams["vnp_TxnRef"];
  const vnpOrderInfo = vnpParams["vnp_OrderInfo"] ?? "";

  const documentIdMatch = vnpOrderInfo.match(/tai lieu ([a-z0-9]+)/i);
  const documentId = documentIdMatch?.[1];

  if (vnpResponseCode === "00" && orderId) {
    await prisma.purchase.updateMany({
      where: { orderId },
      data: { status: "success", completedAt: new Date() },
    });

    if (documentId) {
      return NextResponse.redirect(
        `${APP_URL}/thanh-toan/thanh-cong?orderId=${orderId}&documentId=${documentId}`
      );
    }
  }

  return NextResponse.redirect(`${APP_URL}/thanh-toan/loi`);
}
