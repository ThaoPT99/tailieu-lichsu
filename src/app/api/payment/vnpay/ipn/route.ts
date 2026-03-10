import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const vnpParams = Object.fromEntries(searchParams.entries());
  const vnpSecureHash = vnpParams["vnp_SecureHash"];
  delete vnpParams["vnp_SecureHash"];
  delete vnpParams["vnp_SecureHashType"];

  const hashSecret = process.env.VNPAY_HASH_SECRET;
  if (!hashSecret) {
    return NextResponse.json({ RspCode: "99", Message: "Invalid config" });
  }

  const sortedParams = Object.keys(vnpParams)
    .sort()
    .filter((k) => vnpParams[k])
    .map((k) => `${k}=${encodeURIComponent(vnpParams[k]!)}`)
    .join("&");

  const hmac = crypto.createHmac("sha512", hashSecret);
  const computedHash = hmac.update(Buffer.from(sortedParams, "utf-8")).digest("hex");

  if (computedHash !== vnpSecureHash) {
    return NextResponse.json({ RspCode: "97", Message: "Invalid signature" });
  }

  const vnpResponseCode = vnpParams["vnp_ResponseCode"];
  const orderId = vnpParams["vnp_TxnRef"];
  const vnpAmount = vnpParams["vnp_Amount"];

  if (!orderId) {
    return NextResponse.json({ RspCode: "99", Message: "Missing orderId" });
  }

  const purchase = await prisma.purchase.findUnique({
    where: { orderId },
  });

  if (!purchase) {
    return NextResponse.json({ RspCode: "01", Message: "Order not found" });
  }

  if (purchase.status === "success") {
    return NextResponse.json({ RspCode: "02", Message: "Order already confirmed" });
  }

  const expectedAmount = purchase.amount * 100;
  if (vnpAmount && parseInt(vnpAmount, 10) !== expectedAmount) {
    return NextResponse.json({ RspCode: "04", Message: "Invalid amount" });
  }

  if (vnpResponseCode === "00") {
    await prisma.purchase.update({
      where: { orderId },
      data: { status: "success", completedAt: new Date() },
    });
  } else {
    await prisma.purchase.update({
      where: { orderId },
      data: { status: "failed" },
    });
  }

  return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
}
