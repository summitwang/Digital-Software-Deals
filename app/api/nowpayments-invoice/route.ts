import { randomUUID } from "node:crypto";
import { checkoutQuantity, checkoutTotal } from "@/lib/checkoutPricing";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

async function getUserIdFromRequest(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;

  return data.user.id;
}

export async function POST(req: Request) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://softdealshub.com";

  if (!apiKey) {
    return NextResponse.json(
      { error: "NOWPayments API key is not configured." },
      { status: 500 }
    );
  }

  const userId = await getUserIdFromRequest(req);
  let body;
  try {
    body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    product_id,
    amount,
    quantity,
    customer_name,
    customer_email,
    address,
  } = body;

  let orderQuantity: number;
  try {
    orderQuantity = checkoutQuantity(quantity);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  if ((typeof product_id !== "string" || !product_id || product_id.length > 128) || !amount || !customer_email) {
    return NextResponse.json(
      { error: "Product, amount and email are required." },
      { status: 400 }
    );
  }

  const { data: productData, error: productError } = await supabaseAdmin
    .from("products")
    .select("id, title, stock, price, promo_price, product_type")
    .eq("id", product_id)
    .eq("is_active", true)
    .maybeSingle();

  if (productError || !productData) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const product = productData.title;
  let expectedAmount: number;
  try {
    expectedAmount = checkoutTotal(productData, orderQuantity, amount);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
  const product_type = productData.product_type;

  const order_no = "ORD-" + randomUUID();

  const invoiceRes = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: expectedAmount,
      price_currency: "usd",
      order_id: order_no,
      order_description: `${product} x ${orderQuantity}`,
      ipn_callback_url: `${siteUrl}/api/nowpayments-webhook`,
      success_url: `${siteUrl}/payment/success?orderId=${order_no}`,
      cancel_url: `${siteUrl}/payment?productId=${encodeURIComponent(String(productData.id))}`,
    }),
  });

  const invoiceData = await invoiceRes.json();

  if (!invoiceRes.ok) {
    return NextResponse.json(
      { error: invoiceData.message || "Create invoice failed." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert([
      {
        user_id: userId,
        order_no,
        product,
        product_ref: String(productData.id),
        amount: expectedAmount,
        quantity: orderQuantity,
        product_type: product_type || "",
        customer_name,
        customer_email,
        address,
        status: "pending_verify",
        payment_provider: "nowpayments",
        payment_status: "waiting",
        nowpayments_invoice_id: String(invoiceData.id || ""),
        stock_deducted: false,
        delivery_note: "NOWPayments invoice created. Waiting for payment confirmation.",
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    order: data,
    invoice_url: invoiceData.invoice_url,
    invoice: invoiceData,
  });
}
