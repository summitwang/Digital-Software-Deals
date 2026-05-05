"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Order = {
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

  async function searchOrder(value?: string) {
    const targetOrder = value || orderNo;

    if (!targetOrder) {
      alert("Please enter your order ID");
      return;
    }

    setError("");
    setOrder(null);

    const res = await fetch(`/api/track?orderNo=${encodeURIComponent(targetOrder)}`);
    const data = await res.json();

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
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-2xl mx-auto bg-white/10 border border-white/10 rounded-3xl p-8">
        <h1 className="text-3xl font-bold mb-6">Track Your Order</h1>

        <div className="flex gap-3 mb-6">
          <input
            className="flex-1 p-3 rounded-xl text-black"
            placeholder="Enter Order ID, e.g. ORD-123456"
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
          />

          <button
            onClick={() => searchOrder()}
            className="bg-green-500 text-black font-bold px-6 rounded-xl"
          >
            Search
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-4">
            {error}
          </div>
        )}

        {order && (
          <div className="bg-black/30 rounded-2xl p-6 space-y-4">
            <div>
              <p className="text-slate-400">Order ID</p>
              <p className="text-xl font-bold text-green-400">{order.order_no}</p>
            </div>

            <div>
              <p className="text-slate-400">Product</p>
              <p className="font-bold">{order.product}</p>
            </div>

            <div>
              <p className="text-slate-400">Amount</p>
              <p className="font-bold">${order.amount} USDT</p>
            </div>

            <div>
              <p className="text-slate-400">Status</p>
              <p className="font-bold uppercase text-yellow-400">{order.status}</p>
            </div>

            <div>
              <p className="text-slate-400">Created At</p>
              <p>{new Date(order.created_at).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrackContent />
    </Suspense>
  );
}
