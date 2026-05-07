import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function checkPassword(password: string) {
  return password === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data || [] });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!checkPassword(body.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    title,
    description,
    price,
    original_price,
    promo_price,
    image_url,
    tag,
    product_type,
    sold_count,
    stock,
  } = body;

  const finalPrice = Number(promo_price || price || 0);

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert([
      {
        title,
        description,
        price: finalPrice,
        original_price: original_price ? Number(original_price) : null,
        promo_price: promo_price ? Number(promo_price) : finalPrice,
        image_url,
        tag,
        product_type,
        sold_count: Number(sold_count || 0),
        stock: Number(stock || 999),
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, product: data });
}

export async function DELETE(req: Request) {
  const body = await req.json();

  if (!checkPassword(body.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = body;

  const { error } = await supabaseAdmin
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
