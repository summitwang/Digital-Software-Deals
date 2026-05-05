import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const body = await req.json();

  const order_no = "ORD-" + Date.now();

  const { product, amount, customer_name, customer_email, address, txid } = body;

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert([
      {
        order_no,
        product,
        amount: Number(amount),
        customer_name,
        customer_email,
        address,
        txid,
        status: "pending",
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
  });
}
