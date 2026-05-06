import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const rateLimitMap = new Map<string, { count: number; time: number }>();

function getIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.time > 10 * 60 * 1000) {
    rateLimitMap.set(ip, { count: 1, time: now });
    return false;
  }

  if (record.count >= 5) {
    return true;
  }

  record.count += 1;
  return false;
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data || [] });
}

export async function POST(req: Request) {
  const ip = getIp(req);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json();

  const {
    product,
    amount,
    customer_name,
    customer_email,
    address,
    txid,
    screenshot_base64,
    screenshot_name,
  } = body;

  if (!product || !amount || !customer_email || !txid || !screenshot_base64) {
    return NextResponse.json(
      { error: "Missing required payment information." },
      { status: 400 }
    );
  }

  const order_no = "ORD-" + Date.now();
  let payment_screenshot_url = "";

  try {
    const base64Data = screenshot_base64.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const fileExt = screenshot_name?.split(".").pop() || "png";
    const filePath = `${order_no}.${fileExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("payment-screenshots")
      .upload(filePath, buffer, {
        contentType: "image/*",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("payment-screenshots")
      .getPublicUrl(filePath);

    payment_screenshot_url = publicUrlData.publicUrl;
  } catch {
    return NextResponse.json(
      { error: "Screenshot upload failed." },
      { status: 500 }
    );
  }

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
        status: "paid",
        payment_screenshot_url,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, order: data });
}
