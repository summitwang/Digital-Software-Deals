"use client";

import { useState } from "react";
import Link from "next/link";

type InventoryItem = {
  id: string;
  product_type: string;
  item_type: string;
  license_key?: string;
  account_email?: string;
  account_password?: string;
  tutorial_link?: string;
  reusable: boolean;
  used: boolean;
  used_order_no?: string;
  created_at: string;
};

const productTypes = [
  "windows_key",
  "office_key",
  "office_account",
  "gemini_account",
  "adobe_account",
  "autodesk_account",
  "other",
];

const itemTypes = ["key", "account"];

export default function InventoryPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    product_type: "windows_key",
    item_type: "key",
    license_key: "",
    account_email: "",
    account_password: "",
    tutorial_link: "",
    reusable: true,
  });

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
    loadInventory();
  }

  async function loadInventory() {
    setLoading(true);

    const res = await fetch("/api/inventory", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Load inventory failed");
      return;
    }

    setItems(data.items || []);
  }

  async function addItem() {
    const res = await fetch("/api/inventory", {
      method: "PUT",
      body: JSON.stringify({
        password,
        ...form,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Add failed");
      return;
    }

    alert("Inventory added");

    setForm({
      product_type: "windows_key",
      item_type: "key",
      license_key: "",
      account_email: "",
      account_password: "",
      tutorial_link: "",
      reusable: true,
    });

    loadInventory();
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this inventory item?")) return;

    const res = await fetch("/api/inventory", {
      method: "DELETE",
      body: JSON.stringify({ password, id }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Delete failed");
      return;
    }

    loadInventory();
  }

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
        <div className="bg-white border rounded-3xl p-8 shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-extrabold mb-6">Inventory Login</h1>

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
            <h1 className="text-3xl font-extrabold">Inventory Management</h1>
            <p className="text-slate-600 mt-2">
              Add reusable keys or one-time accounts for automatic delivery.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/admin/orders" className="bg-white border px-5 py-3 rounded-xl">
              Orders
            </Link>

            <Link href="/admin" className="bg-white border px-5 py-3 rounded-xl">
              Products
            </Link>

            <button
              onClick={loadInventory}
              className="bg-black text-white px-5 py-3 rounded-xl font-bold"
            >
              Refresh
            </button>
          </div>
        </div>

        <section className="bg-white border rounded-3xl p-6 shadow mb-8">
          <h2 className="text-2xl font-bold mb-5">Add Inventory</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-2">Product Type</label>
              <select
                className="w-full border p-4 rounded-xl"
                value={form.product_type}
                onChange={(e) =>
                  setForm({ ...form, product_type: e.target.value })
                }
              >
                {productTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-2">Item Type</label>
              <select
                className="w-full border p-4 rounded-xl"
                value={form.item_type}
                onChange={(e) =>
                  setForm({ ...form, item_type: e.target.value })
                }
              >
                {itemTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <Field
              label="License Key"
              value={form.license_key}
              placeholder="XXXXX-XXXXX-XXXXX"
              onChange={(v) => setForm({ ...form, license_key: v })}
            />

            <Field
              label="Account Email"
              value={form.account_email}
              placeholder="account@example.com"
              onChange={(v) => setForm({ ...form, account_email: v })}
            />

            <Field
              label="Account Password"
              value={form.account_password}
              placeholder="password"
              onChange={(v) => setForm({ ...form, account_password: v })}
            />

            <Field
              label="Tutorial Link"
              value={form.tutorial_link}
              placeholder="https://..."
              onChange={(v) => setForm({ ...form, tutorial_link: v })}
            />

            <label className="flex items-center gap-3 bg-slate-50 border rounded-xl p-4">
              <input
                type="checkbox"
                checked={form.reusable}
                onChange={(e) =>
                  setForm({ ...form, reusable: e.target.checked })
                }
              />
              <span className="font-bold">Reusable</span>
            </label>
          </div>

          <button
            onClick={addItem}
            className="mt-5 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-extrabold"
          >
            Add Inventory
          </button>
        </section>

        <section className="bg-white border rounded-3xl p-6 shadow">
          <h2 className="text-2xl font-bold mb-5">Inventory Items</h2>

          {loading && <p>Loading...</p>}

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div>
                    <p className="font-extrabold text-lg">
                      {item.product_type} · {item.item_type}
                    </p>

                    {item.license_key && (
                      <p className="text-sm break-all">
                        Key: <b>{item.license_key}</b>
                      </p>
                    )}

                    {item.account_email && (
                      <p className="text-sm break-all">
                        Account: <b>{item.account_email}</b>
                      </p>
                    )}

                    {item.account_password && (
                      <p className="text-sm break-all">
                        Password: <b>{item.account_password}</b>
                      </p>
                    )}

                    {item.tutorial_link && (
                      <p className="text-sm break-all">
                        Tutorial:{" "}
                        <a
                          href={item.tutorial_link}
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          {item.tutorial_link}
                        </a>
                      </p>
                    )}

                    <p className="text-sm text-slate-500 mt-2">
                      Reusable: {item.reusable ? "Yes" : "No"} · Used:{" "}
                      {item.used ? "Yes" : "No"}
                    </p>

                    {item.used_order_no && (
                      <p className="text-sm text-slate-500">
                        Used Order: {item.used_order_no}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => deleteItem(item.id)}
                    className="bg-red-500 text-white px-5 py-3 rounded-xl h-fit"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {items.length === 0 && !loading && (
              <div className="text-slate-500 text-center p-10">
                No inventory yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
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
