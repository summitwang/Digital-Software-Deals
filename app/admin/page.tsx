"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  promo_price?: number;
  image_url?: string;
  tag?: string;
  product_type?: string;
  sold_count?: number;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    original_price: "",
    promo_price: "",
    image_url: "",
    tag: "Best Seller",
    product_type: "office_account",
    sold_count: "100",
  });

  async function login() {
    const res = await fetch("/api/admin-login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (data.success) {
      setLoggedIn(true);
      loadProducts();
    } else {
      alert("Wrong password");
    }
  }

  async function loadProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data.products || []);
  }

  async function handleImage(file?: File) {
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("Image must be under 3MB");
      return;
    }

    setUploading(true);

    const reader = new FileReader();

    reader.onload = async () => {
      const res = await fetch("/api/upload-product-image", {
        method: "POST",
        body: JSON.stringify({
          password,
          image_base64: String(reader.result),
          image_name: file.name,
        }),
      });

      const data = await res.json();
      setUploading(false);

      if (!res.ok) {
        alert(data.error || "Upload failed");
        return;
      }

      setForm({ ...form, image_url: data.image_url });
      alert("Image uploaded");
    };

    reader.readAsDataURL(file);
  }

  async function addProduct() {
    if (!form.title || !form.promo_price) {
      alert("Please enter product title and promo price");
      return;
    }

    const res = await fetch("/api/products", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        price: form.promo_price,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Add product failed");
      return;
    }

    alert("Product added successfully");

    setForm({
      title: "",
      description: "",
      original_price: "",
      promo_price: "",
      image_url: "",
      tag: "Best Seller",
      product_type: "office_account",
      sold_count: "100",
    });

    loadProducts();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;

    const res = await fetch("/api/products", {
      method: "DELETE",
      body: JSON.stringify({ id, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Delete failed");
      return;
    }

    loadProducts();
  }

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
        <div className="bg-white border rounded-3xl p-8 shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-extrabold mb-6">Product Admin Login</h1>

          <input
            type="password"
            placeholder="Admin password"
            className="w-full border p-4 rounded-xl mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={login}
            className="w-full bg-black text-white font-bold py-4 rounded-xl"
          >
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold">Product Admin</h1>
            <p className="text-slate-600 mt-2">
              Add products, upload images, and set original/promo prices.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/admin/orders" className="bg-white border px-5 py-3 rounded-xl">
              Orders
            </Link>

            <Link href="/admin/inventory" className="bg-white border px-5 py-3 rounded-xl">
              Inventory
            </Link>
          </div>
        </div>

        <section className="bg-white rounded-3xl shadow p-6 mb-10">
          <h2 className="text-2xl font-bold mb-5">Add Product</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Product title"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
            />

            <Input
              placeholder="Original price, e.g. 49.99"
              type="number"
              value={form.original_price}
              onChange={(v) => setForm({ ...form, original_price: v })}
            />

            <Input
              placeholder="Promo price, e.g. 19.99"
              type="number"
              value={form.promo_price}
              onChange={(v) => setForm({ ...form, promo_price: v })}
            />

            <Input
              placeholder="Tag, e.g. Best Seller"
              value={form.tag}
              onChange={(v) => setForm({ ...form, tag: v })}
            />

            <select
              className="border p-4 rounded-xl"
              value={form.product_type}
              onChange={(e) =>
                setForm({ ...form, product_type: e.target.value })
              }
            >
              <option value="windows_key">windows_key</option>
              <option value="office_key">office_key</option>
              <option value="office_account">office_account</option>
              <option value="adobe_account">adobe_account</option>
              <option value="autodesk_account">autodesk_account</option>
              <option value="gemini_account">gemini_account</option>
              <option value="other">other</option>
            </select>

            <Input
              placeholder="Sold count"
              type="number"
              value={form.sold_count}
              onChange={(v) => setForm({ ...form, sold_count: v })}
            />

            <div className="border rounded-xl p-4 md:col-span-2">
              <p className="font-bold mb-2">Product Image</p>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImage(e.target.files?.[0])}
              />

              {uploading && <p className="text-blue-600 mt-2">Uploading...</p>}

              {form.image_url && (
                <div className="mt-4">
                  <img
                    src={form.image_url}
                    alt="preview"
                    className="w-48 rounded-xl border"
                  />
                  <p className="text-xs text-slate-500 break-all mt-2">
                    {form.image_url}
                  </p>
                </div>
              )}
            </div>

            <textarea
              className="border p-4 rounded-xl md:col-span-2 min-h-[120px]"
              placeholder="Product description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <button
            onClick={addProduct}
            className="mt-5 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-extrabold"
          >
            Add Product
          </button>
        </section>

        <section className="bg-white rounded-3xl shadow p-6">
          <h2 className="text-2xl font-bold mb-5">Products</h2>

          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded-2xl p-4 flex flex-col md:flex-row md:justify-between gap-4"
              >
                <div className="flex gap-4">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-24 h-24 object-cover rounded-xl border"
                    />
                  )}

                  <div>
                    <h3 className="font-bold text-xl">{product.title}</h3>
                    <p className="text-slate-600">{product.description}</p>

                    <div className="mt-2 flex gap-3 items-center">
                      {product.original_price && (
                        <span className="line-through text-slate-400">
                          ${product.original_price}
                        </span>
                      )}
                      <span className="font-bold text-green-600 text-xl">
                        ${product.promo_price || product.price}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500">
                      {product.tag} · {product.product_type} ·{" "}
                      {product.sold_count || 0} sold
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => deleteProduct(product.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl h-fit"
                >
                  Delete
                </button>
              </div>
            ))}

            {products.length === 0 && (
              <p className="text-slate-500">No products yet.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Input({
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  placeholder: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      className="border p-4 rounded-xl"
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
