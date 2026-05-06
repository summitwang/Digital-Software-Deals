import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function checkPassword(password: string) {
  return password === process.env.ADMIN_PASSWORD;
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!checkPassword(body.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("inventory_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data || [] });
}

export async function PUT(req: Request) {
  const body = await req.json();

  if (!checkPassword(body.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    product_type,
    item_type,
    license_key,
    account_email,
    account_password,
    tutorial_link,
    reusable,
  } = body;

  if (!product_type || !item_type) {
    return NextResponse.json(
      { error: "Product type and item type are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("inventory_items")
    .insert([
      {
        product_type,
        item_type,
        license_key: license_key || "",
        account_email: account_email || "",
        account_password: account_password || "",
        tutorial_link: tutorial_link || "",
        reusable: Boolean(reusable),
        used: false,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, item: data });
}

export async function DELETE(req: Request) {
  const body = await req.json();

  if (!checkPassword(body.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = body;

  const { error } = await supabaseAdmin
    .from("inventory_items")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
