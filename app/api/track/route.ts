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

  return NextResponse.json({ order: data });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { order_no, error_code, installation_id } = body;

  if (!order_no) {
    return NextResponse.json(
      { error: "Order number is required" },
      { status: 400 }
    );
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
