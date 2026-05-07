"use client";

import { useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  order_no: string;
  product: string;
  amount: number;
  quantity?: number;
  customer_name?: string;
  customer_email?: string;
  address?: string;
  txid?: string;
  payment_screenshot_url?: string;
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
  "pending_verify",
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
        account_password: "",
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
          Account 产品流程：在 Account List 里面一行填写一套账号密码，例如：email----password。
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
              按产品类型处理订单、填写密钥/账号/CID/教程。
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/admin" className="bg-white border px-5 py-3 rounded-xl">
              Product Admin
            </Link>

            <Link href="/admin/inventory" className="bg-white border px-5 py-3 rounded-xl">
              Inventory
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
                <Info label="Quantity" value={String(order.quantity || 1)} />
                <Info label="Customer Email" value={order.customer_email || "-"} />
                <Info label="Customer Name" value={order.customer_name || "-"} />
                <Info label="TxID" value={order.txid || "-"} wide />
                <Info label="Customer Notes / Account Info" value={order.address || "-"} wide />

                {order.payment_screenshot_url && (
                  <div className="bg-slate-50 border rounded-xl p-4 md:col-span-2">
                    <p className="text-sm text-slate-500 mb-2">Payment Screenshot</p>
                    <a
                      href={order.payment_screenshot_url}
                      target="_blank"
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                    >
                      View Screenshot
                    </a>
                  </div>
                )}
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
                    value={order.status || "pending_verify"}
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
                  placeholder="One key per line"
                  multiline
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
                  multiline
                  onChange={(v) => updateLocalOrder(index, "installation_id", v)}
                />

                <Field
                  label="Confirmation ID"
                  value={order.confirmation_id || ""}
                  placeholder="Confirmation ID after phone activation"
                  multiline
                  onChange={(v) => updateLocalOrder(index, "confirmation_id", v)}
                />

                <div className="md:col-span-2">
                  <Field
                    label="Account List"
                    value={order.account_email || ""}
                    placeholder={`One account per line, for example:\nm21709@365mso.com----Yc967663\nm21710@365mso.com----Sr572897`}
                    multiline
                    onChange={(v) => updateLocalOrder(index, "account_email", v)}
                  />
                </div>

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

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => saveOrder({ ...order, status: "paid" })}
                  className="bg-blue-500 hover:bg-blue-400 text-white px-5 py-3 rounded-xl font-bold"
                >
                  ✅ Mark Paid
                </button>

                <button
                  onClick={() => saveOrder({ ...order, status: "account_sent" })}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-3 rounded-xl font-bold"
                >
                  👤 Account Sent
                </button>

                <button
                  onClick={() => saveOrder({ ...order, status: "key_sent" })}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-3 rounded-xl font-bold"
                >
                  🔑 Key Sent
                </button>

                <button
                  onClick={() => saveOrder({ ...order, status: "need_install_id" })}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-xl font-bold"
                >
                  🆔 Need Installation ID
                </button>

                <button
                  onClick={() => saveOrder({ ...order, status: "cid_sent" })}
                  className="bg-purple-500 hover:bg-purple-400 text-white px-5 py-3 rounded-xl font-bold"
                >
                  ✅ CID Sent
                </button>

                <button
                  onClick={() => saveOrder({ ...order, status: "completed" })}
                  className="bg-black hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold"
                >
                  🚚 Completed
                </button>

                <button
                  onClick={() => saveOrder({ ...order, status: "problem" })}
                  className="bg-red-500 hover:bg-red-400 text-white px-5 py-3 rounded-xl font-bold"
                >
                  ⚠️ Problem
                </button>

                <button
                  onClick={() => saveOrder(order)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-3 rounded-xl font-bold"
                >
                  💾 Save Fields
                </button>
              </div>
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
      <p className="font-bold break-all whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="block font-bold mb-2">{label}</label>

      {multiline ? (
        <textarea
          className="w-full border p-4 rounded-xl min-h-[140px] whitespace-pre-wrap"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="w-full border p-4 rounded-xl"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
