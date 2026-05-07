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

  const finalPrice = Number(body.promo_price || body.price || 0);

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert([
      {
        title: body.title,
        description: body.description,
        price: finalPrice,
        original_price: body.original_price ? Number(body.original_price) : null,
        promo_price: body.promo_price ? Number(body.promo_price) : finalPrice,
        image_url: body.image_url,
        tag: body.tag,
        product_type: body.product_type,
        sold_count: Number(body.sold_count || 0),
        stock: Number(body.stock || 999),
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

export async function PATCH(req: Request) {
  const body = await req.json();

  if (!checkPassword(body.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const finalPrice = Number(body.promo_price || body.price || 0);

  const { data, error } = await supabaseAdmin
    .from("products")
    .update({
      title: body.title,
      description: body.description,
      price: finalPrice,
      original_price: body.original_price ? Number(body.original_price) : null,
      promo_price: body.promo_price ? Number(body.promo_price) : finalPrice,
      image_url: body.image_url,
      tag: body.tag,
      product_type: body.product_type,
      sold_count: Number(body.sold_count || 0),
      stock: Number(body.stock || 0),
    })
    .eq("id", body.id)
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

  const { error } = await supabaseAdmin
    .from("products")
    .update({ is_active: false })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
