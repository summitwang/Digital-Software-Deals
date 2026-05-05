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

const statusOptions = [
  "pending",
  "paid",
  "key_sent",
  "need_install_id",
  "cid_sent",
  "account_sent",
  "completed",
  "problem",
];

const productTypeOptions = [
  "windows_key",
  "office_key",
  "office_account",
  "adobe_account",
  "autodesk_account",
  "gemini_account",
  "other",
];

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

  function updateLocalOrder(index: number, key: keyof Order, value: string) {
    const newOrders = [...orders];
    newOrders[index] = {
      ...newOrders[index],
      [key]: value,
    };
    setOrders(newOrders);
  }

  async function saveOrder(order: Order) {
    const res = await fetch("/api/admin-orders", {
      method: "PATCH",
      body: JSON.stringify({
        password,
        order_no: order.order_no,
        status: order.status,
        product_type: order.product_type || "",
        license_key: order.license_key || "",
        error_code: order.error_code || "",
        installation_id: order.installation_id || "",
        confirmation_id: order.confirmation_id || "",
        account_email: order.account_email || "",
        account_password: order.account_password || "",
        tutorial_link: order.tutorial_link || "",
        delivery_note: order.delivery_note || "",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Update failed");
      return;
    }

    alert("Order saved");
    loadOrders();
  }

  function renderTypeHelp(type?: string) {
    if (type === "windows_key" || type === "office_key") {
      return (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-4 text-sm">
          Key 产品流程：先发 License Key + 教程；如果客户激活失败，让客户提交错误代码或 Installation ID；然后你填写 Confirmation ID。
        </div>
      );
    }

    if (
      type === "adobe_account" ||
      type === "autodesk_account" ||
      type === "office_account" ||
      type === "gemini_account"
    ) {
      return (
        <div className="bg-purple-50 border border-purple-200 text-purple-700 rounded-xl p-4 text-sm">
          Account 产品流程：填写账号、密码和教程链接。Adobe / Autodesk 如果需要客户邮箱，可参考订单里的 customer email / notes。
        </div>
      );
    }

    return (
      <div className="bg-slate-50 border rounded-xl p-4 text-sm text-slate-600">
        请选择产品类型，然后按对应字段处理订单。
      </div>
    );
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
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold">Order Management</h1>
            <p className="text-slate-600 mt-2">
              按产品类型处理订单、填写密钥/账号/确认ID/教程。
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
              <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-5">
                <div>
                  <p className="text-sm text-slate-500">Order ID</p>
                  <p className="text-xl font-extrabold text-emerald-600">
                    {order.order_no}
                  </p>
                </div>

                <div className="md:text-right">
                  <p className="text-sm text-slate-500">Created At</p>
                  <p className="font-bold">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-5">
                <Info label="Product" value={order.product} />
                <Info label="Amount" value={`$${order.amount} USDT`} />
                <Info label="Customer Email" value={order.customer_email || "-"} />
                <Info label="Customer Name" value={order.customer_name || "-"} />
                <Info label="TxID" value={order.txid || "-"} wide />
                <Info label="Customer Notes / Account Info" value={order.address || "-"} wide />
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block font-bold mb-2">Product Type</label>
                  <select
                    className="w-full border p-4 rounded-xl"
                    value={order.product_type || "other"}
                    onChange={(e) =>
                      updateLocalOrder(index, "product_type", e.target.value)
                    }
                  >
                    {productTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-2">Order Status</label>
                  <select
                    className="w-full border p-4 rounded-xl"
                    value={order.status || "pending"}
                    onChange={(e) =>
                      updateLocalOrder(index, "status", e.target.value)
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-5">{renderTypeHelp(order.product_type)}</div>

              <div className="grid md:grid-cols-2 gap-4">
                <Field
                  label="License Key"
                  value={order.license_key || ""}
                  placeholder="Windows / Office Key"
                  onChange={(v) => updateLocalOrder(index, "license_key", v)}
                />

                <Field
                  label="Error Code"
                  value={order.error_code || ""}
                  placeholder="Customer activation error code"
                  onChange={(v) => updateLocalOrder(index, "error_code", v)}
                />

                <Field
                  label="Installation ID"
                  value={order.installation_id || ""}
                  placeholder="Customer Installation ID"
                  onChange={(v) => updateLocalOrder(index, "installation_id", v)}
                />

                <Field
                  label="Confirmation ID"
                  value={order.confirmation_id || ""}
                  placeholder="Confirmation ID after phone activation"
                  onChange={(v) => updateLocalOrder(index, "confirmation_id", v)}
                />

                <Field
                  label="Account Email"
                  value={order.account_email || ""}
                  placeholder="Account email to deliver"
                  onChange={(v) => updateLocalOrder(index, "account_email", v)}
                />

                <Field
                  label="Account Password"
                  value={order.account_password || ""}
                  placeholder="Account password"
                  onChange={(v) => updateLocalOrder(index, "account_password", v)}
                />

                <Field
                  label="Tutorial Link"
                  value={order.tutorial_link || ""}
                  placeholder="Usage tutorial / activation guide URL"
                  onChange={(v) => updateLocalOrder(index, "tutorial_link", v)}
                />

                <div>
                  <label className="block font-bold mb-2">Delivery Note</label>
                  <textarea
                    className="w-full border p-4 rounded-xl min-h-[140px]"
                    placeholder="Extra delivery instructions..."
                    value={order.delivery_note || ""}
                    onChange={(e) =>
                      updateLocalOrder(index, "delivery_note", e.target.value)
                    }
                  />
                </div>
              </div>

              <button
                onClick={() => saveOrder(order)}
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

function Info({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`bg-slate-50 border rounded-xl p-4 ${wide ? "md:col-span-2" : ""}`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-bold break-all">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block font-bold mb-2">{label}</label>
      <input
        className="w-full border p-4 rounded-xl"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
