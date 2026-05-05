"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const WALLET_ADDRESS = "TTmc9PhAioNeRVdh5Nb9TZZWJC6dqDZH4o";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const product = searchParams.get("product") || "Unknown Product";
  const amount = searchParams.get("amount") || "0";

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    address: "",
    txid: "",
  });

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    await navigator.clipboard.writeText(WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function submitOrder() {
    if (!form.customer_email || !form.txid) {
      alert("Please enter email and transaction ID");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        product,
        amount,
        ...form,
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
          <h1 className="text-3xl font-extrabold mb-2">
            USDT TRC20 Payment
          </h1>

          <p className="text-slate-600 mb-8">
            Please send the exact amount using TRC20 network, then submit your
            order information.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 border rounded-2xl p-5">
              <p className="text-slate-500 text-sm mb-1">Product</p>
              <p className="font-bold text-lg">{product}</p>
            </div>

            <div className="bg-slate-50 border rounded-2xl p-5">
              <p className="text-slate-500 text-sm mb-1">Amount</p>
              <p className="font-extrabold text-2xl text-emerald-600">
                ${amount} USDT
              </p>
            </div>

            <div className="bg-slate-50 border rounded-2xl p-5">
              <p className="text-slate-500 text-sm mb-1">Network</p>
              <p className="font-bold">TRC20 only</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
              <p className="text-slate-500 text-sm mb-1">Status</p>
              <p className="font-bold text-yellow-700">Waiting for payment</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-5 mb-8">
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
              ⚠️ Only send via TRC20 network. After payment, enter your TxID
              below.
            </p>
          </div>

          <h2 className="text-2xl font-bold mb-4">Submit Your Order</h2>

          <div className="space-y-4">
            <input
              className="w-full p-4 rounded-xl border border-slate-300 text-slate-900 outline-none focus:border-blue-500"
              placeholder="Your Name"
              value={form.customer_name}
              onChange={(e) =>
                setForm({ ...form, customer_name: e.target.value })
              }
            />

            <input
              className="w-full p-4 rounded-xl border border-slate-300 text-slate-900 outline-none focus:border-blue-500"
              placeholder="Email Address"
              value={form.customer_email}
              onChange={(e) =>
                setForm({ ...form, customer_email: e.target.value })
              }
            />

            <input
              className="w-full p-4 rounded-xl border border-slate-300 text-slate-900 outline-none focus:border-blue-500"
              placeholder="Notes / Account Info"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <input
              className="w-full p-4 rounded-xl border border-slate-300 text-slate-900 outline-none focus:border-blue-500"
              placeholder="Transaction ID (TxID)"
              value={form.txid}
              onChange={(e) => setForm({ ...form, txid: e.target.value })}
            />

            <button
              onClick={submitOrder}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-400 text-black font-extrabold py-4 rounded-xl transition"
            >
              {loading ? "Submitting..." : "Submit Payment"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
