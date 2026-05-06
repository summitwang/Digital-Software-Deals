import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const rateMap = new Map<string, { count: number; time: number }>();

const USDT_ADDRESS = process.env.USDT_TRC20_ADDRESS || "";
const USDT_CONTRACT =
  process.env.USDT_TRC20_CONTRACT || "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

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

async function verifyUsdtPayment(txid: string, expectedAmount: number) {
  if (!USDT_ADDRESS) {
    return {
      ok: false,
      error: "USDT wallet address is not configured.",
    };
  }

  const url =
    `https://api.trongrid.io/v1/accounts/${USDT_ADDRESS}/transactions/trc20` +
    `?only_confirmed=true&limit=200&contract_address=${USDT_CONTRACT}`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      ok: false,
      error: "Unable to verify transaction right now.",
    };
  }

  const json = await res.json();
  const transactions = json.data || [];

  const tx = transactions.find(
    (item: any) =>
      String(item.transaction_id).toLowerCase() === txid.toLowerCase()
  );

  if (!tx) {
    return {
      ok: false,
      error: "Transaction not found or not confirmed yet.",
    };
  }

  const toAddress = tx.to;
  const tokenAddress = tx.token_info?.address;
  const decimals = Number(tx.token_info?.decimals || 6);
  const paidAmount = Number(tx.value) / Math.pow(10, decimals);

  if (toAddress !== USDT_ADDRESS) {
    return {
      ok: false,
      error: "Transaction was not sent to our wallet address.",
    };
  }

  if (tokenAddress !== USDT_CONTRACT) {
    return {
      ok: false,
      error: "This is not a USDT TRC20 transaction.",
    };
  }

  if (paidAmount < expectedAmount) {
    return {
      ok: false,
      error: `Payment amount is too low. Paid ${paidAmount} USDT.`,
    };
  }

  return {
    ok: true,
    paidAmount,
  };
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

  if (String(txid).length < 20) {
    return NextResponse.json(
      { error: "Transaction ID looks too short." },
      { status: 400 }
    );
  }

  const expectedAmount = Number(amount);

  const { data: existingTx } = await supabaseAdmin
    .from("orders")
    .select("order_no")
    .eq("txid", txid)
    .maybeSingle();

  if (existingTx) {
    return NextResponse.json(
      { error: "This TxID has already been submitted." },
      { status: 400 }
    );
  }

  const verifyResult = await verifyUsdtPayment(txid, expectedAmount);

  if (!verifyResult.ok) {
    return NextResponse.json(
      { error: verifyResult.error },
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
        amount: expectedAmount,
        product_type: product_type || "",
        customer_name,
        customer_email,
        address,
        txid,
        payment_screenshot_url,
        status: "paid",
        delivery_note: `USDT payment verified automatically. Paid amount: ${verifyResult.paidAmount} USDT`,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, order: data });
}
