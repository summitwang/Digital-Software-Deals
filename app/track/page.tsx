"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Order = {
  order_no: string;
  product: string;
  amount: number;
  quantity?: number;
  status: string;
  product_type?: string;
  license_key?: string;
  error_code?: string;
  installation_id?: string;
  confirmation_id?: string;
  account_email?: string;
  account_password?: string;
  tutorial_link?: string;
  delivery_note?: string;
  created_at: string;
};

const statusMap: Record<string, { text: string; color: string }> = {
  pending_verify: {
    text: "⏳ Payment submitted, waiting for verification",
    color: "text-yellow-600",
  },
  paid: { text: "💰 Payment verified", color: "text-blue-600" },
  key_sent: { text: "🔑 License key sent", color: "text-green-600" },
  need_install_id: {
    text: "🆔 Need Installation ID",
    color: "text-orange-600",
  },
  cid_sent: { text: "✅ Confirmation ID sent", color: "text-purple-600" },
  account_sent: { text: "👤 Account sent", color: "text-green-600" },
  completed: { text: "🚚 Completed", color: "text-emerald-700" },
  problem: { text: "⚠️ Issue detected", color: "text-red-600" },
};

function TrackContent() {
  const searchParams = useSearchParams();
  const defaultOrderId =
    searchParams.get("orderId") || searchParams.get("order") || "";

  const [orderNo, setOrderNo] = useState(defaultOrderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [customerErrorCode, setCustomerErrorCode] = useState("");
  const [customerInstallationId, setCustomerInstallationId] = useState("");

  async function searchOrder(value?: string) {
    const target = value || orderNo;

    if (!target) {
      alert("Please enter your order ID");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    const res = await fetch(`/api/track?orderNo=${encodeURIComponent(target)}`);
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Order not found");
      return;
    }

    setOrder(data.order);
    setCustomerErrorCode(data.order.error_code || "");
    setCustomerInstallationId(data.order.installation_id || "");
  }

  async function submitActivationInfo() {
    if (!order) return;

    if (!customerErrorCode && !customerInstallationId) {
      alert("Please enter error code or Installation ID");
      return;
    }

    const res = await fetch("/api/track", {
      method: "PATCH",
      body: JSON.stringify({
        order_no: order.order_no,
        error_code: customerErrorCode,
        installation_id: customerInstallationId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Submit failed");
      return;
    }

    alert("Information submitted successfully");
    searchOrder(order.order_no);
  }

  useEffect(() => {
    if (defaultOrderId) {
      searchOrder(defaultOrderId);
    }
  }, []);

  const currentStatus =
    order && statusMap[order.status]
      ? statusMap[order.status]
      : { text: order?.status || "", color: "text-slate-600" };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-600 text-sm font-semibold">
          ← Back Home
        </Link>

        <div className="mt-6 bg-white border rounded-3xl p-8 shadow-xl">
          <h1 className="text-3xl font-extrabold mb-2">Track Your Order</h1>

          <p className="text-slate-600 mb-8">
            Enter your order ID to check payment, activation and delivery status.
          </p>

          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <input
              className="flex-1 p-4 rounded-xl border border-slate-300 text-slate-900 outline-none focus:border-blue-500"
              placeholder="Enter Order ID"
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
                <Info label="Product" value={order.product} />
                <Info label="Amount" value={`$${order.amount} USDT`} />
                <Info label="Quantity" value={String(order.quantity || 1)} />
                <Info label="Status" value={currentStatus.text} color={currentStatus.color} />
                <Info
                  label="Created At"
                  value={new Date(order.created_at).toLocaleString()}
                />
              </div>

              {order.license_key && (
                <DeliveryBox title="License Key" value={order.license_key} />
              )}

              {order.account_email && (
                <AccountList value={order.account_email} />
              )}

              {order.confirmation_id && (
                <DeliveryBox
                  title="Confirmation ID"
                  value={order.confirmation_id}
                />
              )}

              {order.tutorial_link && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-4">
                  <p className="font-bold mb-2">Tutorial / Guide</p>
                  <a
                    href={order.tutorial_link}
                    target="_blank"
                    className="underline break-all"
                  >
                    {order.tutorial_link}
                  </a>
                </div>
              )}

              {order.delivery_note && (
                <DeliveryBox title="Delivery Note" value={order.delivery_note} />
              )}

              {(order.product_type === "windows_key" ||
                order.product_type === "office_key" ||
                order.status === "key_sent" ||
                order.status === "need_install_id") && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-5">
                  <h3 className="font-extrabold mb-3">
                    Submit Error Code / Installation ID
                  </h3>

                  <p className="text-sm text-slate-600 mb-4">
                    If activation fails, submit your error code or Installation ID here.
                  </p>

                  <input
                    className="w-full border p-4 rounded-xl mb-3"
                    placeholder="Error Code"
                    value={customerErrorCode}
                    onChange={(e) => setCustomerErrorCode(e.target.value)}
                  />

                  <textarea
                    className="w-full border p-4 rounded-xl min-h-[120px] mb-3"
                    placeholder="Installation ID"
                    value={customerInstallationId}
                    onChange={(e) =>
                      setCustomerInstallationId(e.target.value)
                    }
                  />

                  <button
                    onClick={submitActivationInfo}
                    className="bg-black text-white px-6 py-3 rounded-xl font-bold"
                  >
                    Submit Info
                  </button>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-4 text-sm">
                If your payment has been submitted, please wait for verification and delivery.
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Info({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-slate-500 text-sm">{label}</p>
      <p className={`font-bold break-all ${color || ""}`}>{value}</p>
    </div>
  );
}

function DeliveryBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4">
      <p className="font-bold mb-2">{title}</p>
      <p className="whitespace-pre-wrap break-all">{value}</p>
    </div>
  );
}

function AccountList({ value }: { value: string }) {
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4">
      <p className="font-bold mb-3">Account Delivery</p>

      <div className="space-y-3">
        {lines.map((line, index) => (
          <div key={index} className="bg-white border rounded-xl p-3">
            <p className="text-sm text-slate-500 mb-1">Account #{index + 1}</p>
            <p className="font-bold break-all whitespace-pre-wrap">{line}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <TrackContent />
    </Suspense>
  );
}
