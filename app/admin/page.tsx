"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  tag?: string;
  product_type?: string;
  sold_count?: number;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    image_url: "",
    tag: "Best Seller",
    product_type: "software",
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

  async function addProduct() {
    if (!form.title || !form.price) {
      alert("Please enter product title and price");
      return;
    }

    const res = await fetch("/api/products", {
      method: "POST",
      body: JSON.stringify({
        ...form,
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
      price: "",
      image_url: "",
      tag: "Best Seller",
      product_type: "software",
      sold_count: "100",
    });

    loadProducts();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;

    const res = await fetch("/api/products", {
      method: "DELETE",
      body: JSON.stringify({
        id,
        password,
      }),
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
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white/10 border border-white/10 rounded-3xl p-8">
          <h1 className="text-3xl font-bold mb-6">Admin Login</h1>

          <input
            type="password"
            placeholder="Enter admin password"
            className="w-full p-3 rounded-xl text-black mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={login}
            className="w-full bg-white text-black font-bold py-3 rounded-xl"
          >
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8">Product Admin</h1>

        <section className="bg-white rounded-3xl shadow p-6 mb-10">
          <h2 className="text-2xl font-bold mb-5">Add Product</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              className="border p-3 rounded-xl"
              placeholder="Product title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <input
              className="border p-3 rounded-xl"
              placeholder="Price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <input
              className="border p-3 rounded-xl"
              placeholder="Tag, e.g. Best Seller"
              value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value })}
            />

            <input
              className="border p-3 rounded-xl"
              placeholder="Product type, e.g. office/windows/adobe"
              value={form.product_type}
              onChange={(e) =>
                setForm({ ...form, product_type: e.target.value })
              }
            />

            <input
              className="border p-3 rounded-xl"
              placeholder="Sold count"
              type="number"
              value={form.sold_count}
              onChange={(e) =>
                setForm({ ...form, sold_count: e.target.value })
              }
            />

            <input
              className="border p-3 rounded-xl"
              placeholder="Image URL"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />

            <textarea
              className="border p-3 rounded-xl md:col-span-2"
              placeholder="Product description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <button
            onClick={addProduct}
            className="mt-5 bg-black text-white px-6 py-3 rounded-xl font-bold"
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
                className="border rounded-2xl p-4 flex justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-xl">{product.title}</h3>
                  <p className="text-slate-600">{product.description}</p>
                  <p className="mt-2 font-bold text-green-600">
                    ${product.price}
                  </p>
                  <p className="text-sm text-slate-500">
                    {product.tag} · {product.product_type} ·{" "}
                    {product.sold_count || 0} sold
                  </p>
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