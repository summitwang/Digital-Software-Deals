import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const rateMap = new Map<string, { count: number; time: number }>();

function getIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isLimited(ip: string) {
  const now = Date.now();
  const record = rateMap.get(ip);

  if (!record || now - record.time > 10 * 60 * 1000) {
    rateMap.set(ip, { count: 1, time: now });
    return false;
  }

  if (record.count >= 3) return true;

  record.count += 1;
  return false;
}

export async function POST(req: Request) {
  const ip = getIp(req);

  if (isLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json();

  if (body.website) {
    return NextResponse.json({ error: "Spam detected." }, { status: 400 });
  }

  const {
    product,
    amount,
    product_type,
    customer_name,
    customer_email,
    address,
    txid,
    screenshot_base64,
    screenshot_name,
  } = body;

  if (!product || !amount || !customer_email || !txid || !screenshot_base64) {
    return NextResponse.json(
      { error: "Email, TxID and payment screenshot are required." },
      { status: 400 }
    );
  }

  if (String(txid).length < 10) {
    return NextResponse.json(
      { error: "Transaction ID looks too short." },
      { status: 400 }
    );
  }

  const order_no = "ORD-" + Date.now();
  let payment_screenshot_url = "";

  try {
    const base64Data = screenshot_base64.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const ext = screenshot_name?.split(".").pop() || "png";
    const filePath = `${order_no}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("payment-screenshots")
      .upload(filePath, buffer, {
        contentType: "image/*",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage
      .from("payment-screenshots")
      .getPublicUrl(filePath);

    payment_screenshot_url = data.publicUrl;
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
        product_type: product_type || "",
        customer_name,
        customer_email,
        address,
        txid,
        payment_screenshot_url,
        status: "pending_verify",
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, order: data });
}
