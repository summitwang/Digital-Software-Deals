"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-emerald-400 text-sm">
          ← Back to Products
        </Link>

        <div className="mt-6 bg-white/10 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-3xl font-extrabold mb-2">
            USDT TRC20 Payment
          </h1>

          <p className="text-slate-300 mb-8">
            Please send the exact amount using TRC20 network, then submit your
            order information.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-black/30 rounded-2xl p-5">
              <p className="text-slate-400 text-sm mb-1">Product</p>
              <p className="font-bold text-lg">{product}</p>
            </div>

            <div className="bg-black/30 rounded-2xl p-5">
              <p className="text-slate-400 text-sm mb-1">Amount</p>
              <p className="font-extrabold text-2xl text-emerald-400">
                ${amount} USDT
              </p>
            </div>

            <div className="bg-black/30 rounded-2xl p-5">
              <p className="text-slate-400 text-sm mb-1">Network</p>
              <p className="font-bold">TRC20 only</p>
            </div>

            <div className="bg-black/30 rounded-2xl p-5">
              <p className="text-slate-400 text-sm mb-1">Status</p>
              <p className="font-bold text-yellow-400">Waiting for payment</p>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 mb-8">
            <p className="font-bold mb-2">Wallet Address</p>

            <p className="break-all text-yellow-300 font-mono">
              👉 TTmc9PhAioNeRVdh5Nb9TZ7WCJ6dqDZH4o
            </p>

            <p className="text-sm text-slate-300 mt-4">
              ⚠️ Only send via TRC20 network. After payment, enter your TxID
              below.
            </p>
          </div>

          <h2 className="text-2xl font-bold mb-4">Submit Your Order</h2>

          <div className="space-y-4">
            <input
              className="w-full p-4 rounded-xl text-black outline-none"
              placeholder="Your Name"
              value={form.customer_name}
              onChange={(e) =>
                setForm({ ...form, customer_name: e.target.value })
              }
            />

            <input
              className="w-full p-4 rounded-xl text-black outline-none"
              placeholder="Email Address"
              value={form.customer_email}
              onChange={(e) =>
                setForm({ ...form, customer_email: e.target.value })
              }
            />

            <input
              className="w-full p-4 rounded-xl text-black outline-none"
              placeholder="Notes / Account Info"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <input
              className="w-full p-4 rounded-xl text-black outline-none"
              placeholder="Transaction ID (TxID)"
              value={form.txid}
              onChange={(e) => setForm({ ...form, txid: e.target.value })}
            />

            <button
              onClick={submitOrder}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-500 text-black font-extrabold py-4 rounded-xl transition"
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
