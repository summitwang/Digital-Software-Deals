"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabaseClient";

const WALLET_ADDRESS = "TTmc9PhAioNeRVdh5Nb9TZZWJC6dqDZH4o";

function money(value: number) {
  return value.toFixed(2);
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const product = searchParams.get("product") || "Unknown Product";
  const amountFromUrl = Number(searchParams.get("amount") || "0");
  const quantityFromUrl = Number(searchParams.get("quantity") || "1");
  const stockFromUrl = Number(searchParams.get("stock") || "999");
  const productType = searchParams.get("type") || "other";

  const maxStock = stockFromUrl > 0 ? stockFromUrl : 1;

  const [quantity, setQuantity] = useState(
    Math.min(quantityFromUrl > 0 ? quantityFromUrl : 1, maxStock)
  );

  const unitPrice =
    quantityFromUrl > 0 ? amountFromUrl / quantityFromUrl : amountFromUrl;

  const totalAmount = unitPrice * quantity;

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    address: "",
    txid: "",
    website: "",
  });

  const [screenshotBase64, setScreenshotBase64] = useState("");
  const [screenshotName, setScreenshotName] = useState("");
  const [loading, setLoading] = useState(false);
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      const email = data.session?.user.email || "";
      if (email) {
        setForm((prev) => ({ ...prev, customer_email: email }));
      }
    });
  }, []);

  async function copyAddress() {
    await navigator.clipboard.writeText(WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleScreenshot(file?: File) {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Screenshot must be under 2MB");
      return;
    }

    setScreenshotName(file.name);

    const reader = new FileReader();
    reader.onload = () => setScreenshotBase64(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function payWithCrypto() {
    if (!form.customer_email) {
      alert("Please enter email address first");
      return;
    }

    if (quantity > maxStock) {
      alert(`Only ${maxStock} item(s) available in stock.`);
      return;
    }

    setCryptoLoading(true);

    const { data: sessionData } = await supabaseClient.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch("/api/nowpayments-invoice", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({
        product,
        amount: money(totalAmount),
        quantity,
        product_type: productType,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        address: form.address,
      }),
    });

    const data = await res.json();
    setCryptoLoading(false);

    if (!res.ok) {
      alert(data.error || "Create crypto payment failed");
      return;
    }

    window.location.href = data.invoice_url;
  }

  async function submitManualOrder() {
    if (quantity > maxStock) {
      alert(`Only ${maxStock} item(s) available in stock.`);
      return;
    }

    if (!form.customer_email || !form.txid || !screenshotBase64) {
      alert("Please enter email, TxID and upload payment screenshot");
      return;
    }

    setLoading(true);

    const { data: sessionData } = await supabaseClient.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({
        product,
        amount: money(totalAmount),
        quantity,
        product_type: productType,
        ...form,
        screenshot_base64: screenshotBase64,
        screenshot_name: screenshotName,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Submit failed");
      return;
    }

    router.push(`/payment/success?orderId=${data.order.order_no}`);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-600 text-sm font-semibold">
          ← Back to Products
        </Link>

        <div className="mt-6 bg-white border rounded-3xl p-8 shadow-xl">
          <h1 className="text-3xl font-extrabold mb-2">Crypto Payment</h1>

          <p className="text-slate-600 mb-8">
            Pay with crypto automatically, or use manual USDT TRC20 backup.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Info title="Product" value={product} />

            <div className="border rounded-2xl p-5 bg-slate-50">
              <p className="text-slate-500 text-sm mb-3">Quantity</p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 rounded-xl border bg-white text-xl font-bold"
                >
                  -
                </button>

                <div className="text-2xl font-extrabold w-12 text-center">
                  {quantity}
                </div>

                <button
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                  disabled={quantity >= maxStock}
                  className="w-11 h-11 rounded-xl border bg-white text-xl font-bold disabled:bg-slate-200 disabled:text-slate-400"
                >
                  +
                </button>
              </div>

              <p className="text-sm text-slate-500 mt-3">
                Unit price: ${money(unitPrice)}
              </p>

              <p className="text-sm font-bold text-emerald-600 mt-1">
                Stock available: {maxStock}
              </p>
            </div>

            <Info title="Amount" value={`$${money(totalAmount)} USD`} green />
            <Info title="Status" value="Waiting for payment" yellow />
          </div>

          <h2 className="text-2xl font-bold mb-4">Customer Information</h2>

          <div className="space-y-4 mb-8">
            <input
              className="hidden"
              placeholder="website"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />

            <input
              className="w-full p-4 rounded-xl border border-slate-300"
              placeholder="Your Name"
              value={form.customer_name}
              onChange={(e) =>
                setForm({ ...form, customer_name: e.target.value })
              }
            />

            <input
              className="w-full p-4 rounded-xl border border-slate-300"
              placeholder="Email Address"
              value={form.customer_email}
              onChange={(e) =>
                setForm({ ...form, customer_email: e.target.value })
              }
            />

            <input
              className="w-full p-4 rounded-xl border border-slate-300"
              placeholder="Notes / Account Info"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <button
              onClick={payWithCrypto}
              disabled={cryptoLoading}
              className="w-full bg-black hover:bg-slate-800 disabled:bg-slate-400 text-white font-extrabold py-4 rounded-xl transition"
            >
              {cryptoLoading ? "Creating payment..." : "Pay With Crypto"}
            </button>
          </div>

          <div className="border-t pt-8">
            <h2 className="text-xl font-bold mb-4">Manual USDT TRC20 Backup</h2>

            <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-5 mb-6">
              <p className="font-bold mb-3">Wallet Address</p>

              <div className="flex flex-col md:flex-row gap-3 md:items-center">
                <div className="flex-1 bg-white border rounded-xl p-4 font-mono text-sm break-all">
                  {WALLET_ADDRESS}
                </div>

                <button
                  onClick={copyAddress}
                  className="bg-black text-white px-5 py-3 rounded-xl font-bold"
                >
                  {copied ? "Copied!" : "Copy Address"}
                </button>
              </div>

              <p className="text-sm text-slate-600 mt-4">
                ⚠️ Only send via TRC20 network. Wrong network payments may be
                lost.
              </p>
            </div>

            <div className="space-y-4">
              <input
                className="w-full p-4 rounded-xl border border-slate-300"
                placeholder="Transaction ID (TxID)"
                value={form.txid}
                onChange={(e) => setForm({ ...form, txid: e.target.value })}
              />

              <div className="bg-slate-50 border rounded-xl p-4">
                <p className="font-bold mb-2">Upload Payment Screenshot *</p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleScreenshot(e.target.files?.[0])}
                />

                {screenshotName && (
                  <p className="text-sm text-emerald-600 mt-2">
                    Uploaded: {screenshotName}
                  </p>
                )}
              </div>

              <button
                onClick={submitManualOrder}
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-400 text-black font-extrabold py-4 rounded-xl transition"
              >
                {loading ? "Submitting..." : "Submit Manual Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Info({
  title,
  value,
  green,
  yellow,
}: {
  title: string;
  value: string;
  green?: boolean;
  yellow?: boolean;
}) {
  return (
    <div
      className={`border rounded-2xl p-5 ${
        yellow ? "bg-yellow-50 border-yellow-200" : "bg-slate-50"
      }`}
    >
      <p className="text-slate-500 text-sm mb-1">{title}</p>
      <p
        className={`font-bold text-lg break-all ${
          green ? "text-emerald-600 text-2xl" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
