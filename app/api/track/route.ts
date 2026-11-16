import { authorizeOrder } from "@/lib/orderAuthorization";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderNo = searchParams.get("orderNo");

  if (!orderNo) {
    return NextResponse.json(
      { error: "Order number is required" },
      { status: 400 }
    );
  }

  const access = await authorizeOrder(req, orderNo);
  if (access.error) return NextResponse.json({ error: access.error }, { status: access.status });

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      "order_no, product, amount, quantity, status, product_type, license_key, error_code, installation_id, confirmation_id, account_email, account_password, tutorial_link, delivery_note, created_at"
    )
    .eq("order_no", orderNo)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order: data }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PATCH(req: Request) {
  let body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { order_no, error_code, installation_id } = body;

  if (typeof order_no !== "string" || !order_no || order_no.length > 100) {
    return NextResponse.json(
      { error: "Order number is required" },
      { status: 400 }
    );
  }

  const access = await authorizeOrder(req, order_no);
  if (access.error) return NextResponse.json({ error: access.error }, { status: access.status });
  if ((error_code !== undefined && (typeof error_code !== "string" || error_code.length > 128)) ||
      (installation_id !== undefined && (typeof installation_id !== "string" || installation_id.length > 512))) {
    return NextResponse.json({ error: "Invalid activation details" }, { status: 400 });
  }
  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      error_code: error_code || "",
      installation_id: installation_id || "",
      status: installation_id ? "need_install_id" : "problem",
    })
    .eq("order_no", order_no);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
