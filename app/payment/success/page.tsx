"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Order = {
  id: string;
  status?: string;
  product?: string;
  amount?: string;
};

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    loadOrder();

    const timer = setInterval(() => {
      loadOrder();
    }, 5000);

    return () => clearInterval(timer);
  }, [orderId]);

  async function loadOrder() {
    if (!orderId) return;

    setLoading(true);

    const res = await fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
    });

    const data = await res.json();

    if (data.success) {
      setOrder(data.order);
    }

    setLoading(false);
  }

  function copyOrderId() {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    alert("Order ID copied!");
  }

  const status = order?.status || "Pending";

  const statusColor =
    status === "Pending"
      ? "text-yellow-600"
      : status === "Paid"
      ? "text-green-600"
      : status === "Completed"
      ? "text-blue-600"
      : "text-purple-600";

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow p-8 max-w-lg w-full text-center">
        <div className="text-5xl mb-4">✅</div>

        <h1 className="text-3xl font-bold mb-4">
          Order Submitted Successfully
        </h1>

        <p className="text-slate-600 mb-6">
          Please save your order number. Your payment will be reviewed shortly.
        </p>

        <div className="bg-slate-100 rounded-xl p-4 mb-4">
          <p className="text-sm text-slate-500 mb-1">Your Order ID</p>
          <p className="text-xl font-bold break-all">{orderId}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-slate-500 mb-1">Current Status</p>
          <p className={`text-xl font-bold ${statusColor}`}>{status}</p>
          <p className="text-xs text-slate-500 mt-2">
            {loading ? "Refreshing..." : "Auto refresh every 5 seconds"}
          </p>
        </div>

        {order?.product && (
          <div className="bg-slate-50 border rounded-xl p-4 mb-6 text-left text-sm">
            <p>
              <b>Product:</b> {order.product}
            </p>
            <p>
              <b>Amount:</b> {order.amount}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={copyOrderId}
            className="w-full bg-green-600 text-white py-3 rounded-xl"
          >
            Copy Order ID
          </button>

          <Link
  href={`/track?orderId=${orderId}`}
  className="block w-full bg-black text-white py-3 rounded-xl"
>
  Track Order
</Link>

          <Link
            href="/products"
            className="block w-full border py-3 rounded-xl"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}