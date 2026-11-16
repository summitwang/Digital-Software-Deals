import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function checkPassword(password: string) {
  return Boolean(process.env.ADMIN_PASSWORD) && typeof password === "string" && password === process.env.ADMIN_PASSWORD;
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!checkPassword(body.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data || [] });
}

export async function PATCH(req: Request) {
  const body = await req.json();

  if (!checkPassword(body.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    order_no,
    status,
    product_type,
    license_key,
    error_code,
    installation_id,
    confirmation_id,
    account_email,
    account_password,
    tutorial_link,
    delivery_note,
  } = body;

  if (typeof order_no !== "string" || !order_no || typeof status !== "string") {
    return NextResponse.json({ error: "Order and status are required" }, { status: 400 });
  }
  const { error } = await supabaseAdmin.rpc("update_order_delivery_v1", {
    p_order: order_no,
    p_patch: { status, product_type, license_key, error_code, installation_id,
      confirmation_id, account_email, account_password, tutorial_link, delivery_note },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
