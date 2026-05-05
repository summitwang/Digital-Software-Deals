"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Order = {
  delivery_note?: string;
  order_no: string;
  product: string;
  amount: number;
  status: string;
  created_at: string;
};

function TrackContent() {
  const searchParams = useSearchParams();
  const defaultOrderId = searchParams.get("orderId") || "";

  const [orderNo, setOrderNo] = useState(defaultOrderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function searchOrder(value?: string) {
    const targetOrder = value || orderNo;

    if (!targetOrder) {
      alert("Please enter your order ID");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    const res = await fetch(
      `/api/track?orderNo=${encodeURIComponent(targetOrder)}`
    );

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Order not found");
      return;
    }

    setOrder(data.order);
  }

  useEffect(() => {
    if (defaultOrderId) {
      searchOrder(defaultOrderId);
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-600 text-sm font-semibold">
          ← Back Home
        </Link>

        <div className="mt-6 bg-white border rounded-3xl p-8 shadow-xl">
          <h1 className="text-3xl font-extrabold mb-2">Track Your Order</h1>

          <p className="text-slate-600 mb-8">
            Enter your order ID to check payment and delivery status.
          </p>

          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <input
              className="flex-1 p-4 rounded-xl border border-slate-300 text-slate-900 outline-none focus:border-blue-500"
              placeholder="Enter Order ID, e.g. ORD-123456"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
            />

            <button
              onClick={() => searchOrder()}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-400 text-black font-extrabold px-8 py-4 rounded-xl"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6">
              {error}
            </div>
          )}

          {order && (
            <div className="bg-slate-50 border rounded-2xl p-6 space-y-5">
              <div>
                <p className="text-slate-500 text-sm">Order ID</p>
                <p className="text-2xl font-extrabold text-emerald-600">
                  {order.order_no}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border rounded-xl p-4">
                  <p className="text-slate-500 text-sm">Product</p>
                  <p className="font-bold">{order.product}</p>
                </div>

                <div className="bg-white border rounded-xl p-4">
                  <p className="text-slate-500 text-sm">Amount</p>
                  <p className="font-bold">${order.amount} USDT</p>
                </div>

                <div className="bg-white border rounded-xl p-4">
                  <p className="text-slate-500 text-sm">Status</p>
                  <p
                    className={`font-extrabold uppercase ${
                      order.status === "completed"
                        ? "text-emerald-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {order.status}
                  </p>
                </div>

                <div className="bg-white border rounded-xl p-4">
                  <p className="text-slate-500 text-sm">Created At</p>
                  <p className="font-bold">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {order.delivery_note && (
  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4">
    <p className="font-bold mb-2">Delivery Content</p>
    <p className="whitespace-pre-wrap">{order.delivery_note}</p>
  </div>
)}
              
              <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-4 text-sm">
                If your payment has been submitted, please wait for manual
                verification and delivery.
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <TrackContent />
    </Suspense>
  );
}
