"use client";

import { useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  order_no: string;
  product: string;
  amount: number;
  customer_name?: string;
  customer_email?: string;
  address?: string;
  txid?: string;
  status: string;
  delivery_note?: string;
  created_at: string;
};

export default function AdminOrdersPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  async function login() {
    const res = await fetch("/api/admin-login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (!data.success) {
      alert("Wrong password");
      return;
    }

    setLoggedIn(true);
    loadOrders();
  }

  async function loadOrders() {
    setLoading(true);

    const res = await fetch("/api/admin-orders", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Load orders failed");
      return;
    }

    setOrders(data.orders || []);
  }

  async function updateOrder(order: Order) {
    const res = await fetch("/api/admin-orders", {
      method: "PATCH",
      body: JSON.stringify({
        password,
        order_no: order.order_no,
        status: order.status,
        delivery_note: order.delivery_note || "",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Update failed");
      return;
    }

    alert("Order updated");
    loadOrders();
  }

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
        <div className="bg-white border rounded-3xl p-8 shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-extrabold mb-6">Admin Orders Login</h1>

          <input
            className="w-full border p-4 rounded-xl mb-4"
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={login}
            className="w-full bg-black text-white py-4 rounded-xl font-bold"
          >
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold">Order Management</h1>
            <p className="text-slate-600 mt-2">
              View orders, verify payment, and enter delivery content.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/admin" className="bg-white border px-5 py-3 rounded-xl">
              Product Admin
            </Link>

            <button
              onClick={loadOrders}
              className="bg-black text-white px-5 py-3 rounded-xl font-bold"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading && <p>Loading orders...</p>}

        <div className="space-y-6">
          {orders.map((order, index) => (
            <div key={order.id} className="bg-white border rounded-3xl p-6 shadow">
              <div className="flex justify-between gap-4 mb-5">
                <div>
                  <p className="text-sm text-slate-500">Order ID</p>
                  <p className="text-xl font-extrabold text-emerald-600">
                    {order.order_no}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-500">Created At</p>
                  <p className="font-bold">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-5">
                <div className="bg-slate-50 border rounded-xl p-4">
                  <p className="text-sm text-slate-500">Product</p>
                  <p className="font-bold">{order.product}</p>
                </div>

                <div className="bg-slate-50 border rounded-xl p-4">
                  <p className="text-sm text-slate-500">Amount</p>
                  <p className="font-bold">${order.amount} USDT</p>
                </div>

                <div className="bg-slate-50 border rounded-xl p-4">
                  <p className="text-sm text-slate-500">Customer Email</p>
                  <p className="font-bold">{order.customer_email || "-"}</p>
                </div>

                <div className="bg-slate-50 border rounded-xl p-4">
                  <p className="text-sm text-slate-500">Customer Name</p>
                  <p className="font-bold">{order.customer_name || "-"}</p>
                </div>

                <div className="bg-slate-50 border rounded-xl p-4 md:col-span-2">
                  <p className="text-sm text-slate-500">TxID</p>
                  <p className="font-bold break-all">{order.txid || "-"}</p>
                </div>

                <div className="bg-slate-50 border rounded-xl p-4 md:col-span-2">
                  <p className="text-sm text-slate-500">Notes / Account Info</p>
                  <p className="font-bold">{order.address || "-"}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">Order Status</label>
                  <select
                    className="w-full border p-4 rounded-xl"
                    value={order.status}
                    onChange={(e) => {
                      const newOrders = [...orders];
                      newOrders[index].status = e.target.value;
                      setOrders(newOrders);
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-2">Delivery Content</label>
                  <textarea
                    className="w-full border p-4 rounded-xl min-h-[120px]"
                    placeholder="Enter account / key / activation instruction..."
                    value={order.delivery_note || ""}
                    onChange={(e) => {
                      const newOrders = [...orders];
                      newOrders[index].delivery_note = e.target.value;
                      setOrders(newOrders);
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => updateOrder(order)}
                className="mt-5 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-extrabold"
              >
                Save Order
              </button>
            </div>
          ))}

          {orders.length === 0 && !loading && (
            <div className="bg-white border rounded-3xl p-10 text-center text-slate-500">
              No orders yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
