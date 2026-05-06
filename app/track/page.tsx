"use client";

import { useState } from "react";

type Order = {
  order_no: string;
  product: string;
  amount: number;
  status: string;
  created_at: string;

  account_email?: string;
  account_password?: string;
  license_key?: string;
  confirmation_id?: string;
  tutorial_link?: string;
};

export default function TrackPage() {
  const [orderNo, setOrderNo] = useState("");
  const [order, setOrder] = useState<Order | null>(null);

  const [installationId, setInstallationId] = useState("");
  const [errorCode, setErrorCode] = useState("");

  async function searchOrder() {
    const res = await fetch("/api/track?order_no=" + orderNo);
    const data = await res.json();
    setOrder(data.order);
  }

  async function submitActivation() {
    await fetch("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        order_no: orderNo,
        installation_id: installationId,
        error_code: errorCode,
      }),
    });

    alert("Submitted successfully");
    setInstallationId("");
    setErrorCode("");
  }

  const statusMap: Record<string, { text: string; color: string }> = {
    pending: { text: "⏳ Pending Payment", color: "text-yellow-600" },
    paid: { text: "💰 Payment Received", color: "text-blue-600" },
    key_sent: { text: "🔑 Key Sent", color: "text-green-600" },
    need_install_id: { text: "🆔 Need Installation ID", color: "text-orange-600" },
    cid_sent: { text: "✅ Confirmation ID Sent", color: "text-purple-600" },
    completed: { text: "🚚 Completed", color: "text-emerald-700" },
    problem: { text: "⚠️ Issue Detected", color: "text-red-600" },
  };

  const currentStatus = order
    ? statusMap[order.status] || {
        text: order.status,
        color: "text-gray-500",
      }
    : null;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold mb-2">Track Your Order</h1>
        <p className="text-slate-500 mb-6">
          Enter your order ID to check payment, activation and delivery status.
        </p>

        {/* 搜索 */}
        <div className="flex gap-3 mb-6">
          <input
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
            placeholder="ORD-xxxx"
            className="flex-1 border p-3 rounded-xl"
          />
          <button
            onClick={searchOrder}
            className="bg-green-500 text-white px-5 rounded-xl"
          >
            Search
          </button>
        </div>

        {/* 订单信息 */}
        {order && (
          <div className="border rounded-xl p-6 space-y-4">
            <div className="text-lg font-bold text-emerald-600">
              {order.order_no}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border p-3 rounded-xl">
                <p className="text-sm text-slate-500">Product</p>
                <p className="font-bold">{order.product}</p>
              </div>

              <div className="border p-3 rounded-xl">
                <p className="text-sm text-slate-500">Amount</p>
                <p className="font-bold">${order.amount} USDT</p>
              </div>

              <div className="border p-3 rounded-xl">
                <p className="text-sm text-slate-500">Status</p>
                <p className={`font-bold ${currentStatus?.color}`}>
                  {currentStatus?.text}
                </p>
              </div>

              <div className="border p-3 rounded-xl">
                <p className="text-sm text-slate-500">Created At</p>
                <p className="font-bold">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* 🔑 Key */}
            {order.license_key && (
              <div className="bg-green-50 border p-4 rounded-xl">
                <p className="font-bold mb-2">License Key</p>
                <p className="font-mono">{order.license_key}</p>
              </div>
            )}

            {/* 👤 账号 */}
            {order.account_email && (
              <div className="bg-green-50 border p-4 rounded-xl">
                <p className="font-bold mb-2">Account Delivery</p>
                <p>Email: {order.account_email}</p>
                <p>Password: {order.account_password}</p>
              </div>
            )}

            {/* 🆔 CID */}
            {order.confirmation_id && (
              <div className="bg-purple-50 border p-4 rounded-xl">
                <p className="font-bold mb-2">Confirmation ID</p>
                <p>{order.confirmation_id}</p>
              </div>
            )}

            {/* 📘 教程 */}
            {order.tutorial_link && (
              <div className="bg-blue-50 border p-4 rounded-xl">
                <p className="font-bold mb-2">Tutorial</p>
                <a
                  href={order.tutorial_link}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  View Guide
                </a>
              </div>
            )}

            {/* 🆔 需要安装ID */}
            {order.status === "need_install_id" && (
              <div className="bg-yellow-50 border p-4 rounded-xl">
                <p className="font-bold text-yellow-700 mb-2">
                  Submit Installation ID
                </p>

                <textarea
                  value={installationId}
                  onChange={(e) => setInstallationId(e.target.value)}
                  placeholder="Paste Installation ID here"
                  className="w-full border p-3 rounded-xl mb-3"
                />

                <input
                  value={errorCode}
                  onChange={(e) => setErrorCode(e.target.value)}
                  placeholder="Error Code"
                  className="w-full border p-3 rounded-xl mb-3"
                />

                <button
                  onClick={submitActivation}
                  className="bg-green-500 text-white px-5 py-2 rounded-xl"
                >
                  Submit
                </button>
              </div>
            )}

            <div className="bg-blue-50 border p-4 rounded-xl text-sm">
              If your payment has been submitted, please wait for manual
              verification and delivery.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
