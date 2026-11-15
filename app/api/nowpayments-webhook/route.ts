import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/paymentSignature";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!process.env.NOWPAYMENTS_IPN_SECRET) return NextResponse.json({ error: "Payment callback is not configured" }, { status: 503 });
  const rawBody = await req.text();
  const signature = req.headers.get("x-nowpayments-sig");

  if (!verifyPaymentSignature(rawBody, signature, process.env.NOWPAYMENTS_IPN_SECRET)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  if (!body || typeof body !== "object" || Array.isArray(body) ||
      typeof body.order_id !== "string" || !body.payment_id || !body.invoice_id ||
      typeof body.payment_status !== "string" || typeof body.price_currency !== "string" ||
      !Number.isFinite(Number(body.price_amount)) || Number(body.price_amount) <= 0) {
    return NextResponse.json({ error: "Invalid payment event" }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin.rpc("apply_payment_v1", {
    p_order: body.order_id,
    p_payment: String(body.payment_id),
    p_invoice: String(body.invoice_id),
    p_status: body.payment_status,
    p_amount: Number(body.price_amount),
    p_currency: body.price_currency,
  });
  // 数据库失败必须让上游重试，禁止继续走旧的非事务写入路径。
  if (error) return NextResponse.json({ error: "Payment event could not be applied" }, { status: 503 });
  return NextResponse.json({ success: true, result: data });
}
