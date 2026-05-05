import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderNo = searchParams.get("orderNo");

  if (!orderNo) {
    return NextResponse.json({ error: "Order number is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("order_no, product, amount, status, created_at")
    .eq("order_no", orderNo)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order: data });
}
