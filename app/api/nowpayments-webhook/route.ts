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

  const orderNo = body.order_id;
  const paymentStatus = body.payment_status;
  const paymentId = body.payment_id ? String(body.payment_id) : "";
  const invoiceId = body.invoice_id ? String(body.invoice_id) : "";

  if (!orderNo) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("order_no", orderNo)
    .maybeSingle();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  let newStatus = order.status;

  if (["confirmed", "finished"].includes(paymentStatus)) {
    newStatus = "paid";
  }

  if (["failed", "expired", "refunded"].includes(paymentStatus)) {
    newStatus = "problem";
  }

  if (
    ["confirmed", "finished"].includes(paymentStatus) &&
    !order.stock_deducted
  ) {
    const { data: productData } = await supabaseAdmin
      .from("products")
      .select("id, stock")
      .eq("title", order.product)
      .eq("is_active", true)
      .maybeSingle();

    if (productData) {
      const oldStock = Number(productData.stock || 0);
      const quantity = Number(order.quantity || 1);
      const newStock = Math.max(0, oldStock - quantity);

      await supabaseAdmin
        .from("products")
        .update({ stock: newStock })
        .eq("id", productData.id);
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      status: newStatus,
      payment_status: paymentStatus,
      nowpayments_payment_id: paymentId,
      nowpayments_invoice_id: invoiceId || order.nowpayments_invoice_id,
      stock_deducted:
        ["confirmed", "finished"].includes(paymentStatus) || order.stock_deducted,
      delivery_note:
        ["confirmed", "finished"].includes(paymentStatus)
          ? `NOWPayments payment confirmed. Status: ${paymentStatus}.`
          : `NOWPayments status updated: ${paymentStatus}.`,
    })
    .eq("order_no", orderNo);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
