"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  stock?: number;
};

function getDiscount(original?: number, promo?: number, price?: number) {
  const finalPrice = promo || price || 0;
  if (!original || original <= finalPrice) return null;
  return Math.round(((original - finalPrice) / original) * 100);
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-extrabold">Digital Software Deals</div>

          <div className="flex gap-5 text-sm font-semibold">
            <Link href="/">Home</Link>
            <Link href="#products">Products</Link>
            <Link href="/track">Track Order</Link>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-blue-950 via-slate-950 to-black text-white px-6 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-block bg-red-500 px-5 py-2 rounded-full text-sm font-bold mb-6">
              🔥 Limited Time Software Deals
            </div>

            <h1 className="text-5xl font-extrabold mb-6 leading-tight">
              Save More on Digital Software
            </h1>

            <p className="text-xl text-slate-200 mb-8">
              Windows, Office, Adobe, Autodesk and digital accounts with payment
              verification, order tracking and after-sales support.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#products"
                className="bg-white text-black px-8 py-4 rounded-xl font-bold text-center hover:bg-slate-200"
              >
                Shop Now
              </a>

              <Link
                href="/track"
                className="border border-white px-8 py-4 rounded-xl font-bold text-center hover:bg-white hover:text-black"
              >
                Track Order
              </Link>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-5">Why choose us?</h2>
            <ul className="space-y-4 text-slate-100">
              <li>✅ Fast processing after payment verification</li>
              <li>✅ Order tracking after purchase</li>
              <li>✅ Activation help for key products</li>
              <li>✅ Account delivery and usage tutorial support</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow p-5 text-center font-semibold">
          ⚡ Fast Delivery
        </div>
        <div className="bg-white rounded-2xl shadow p-5 text-center font-semibold">
          🔒 Verified Payment
        </div>
        <div className="bg-white rounded-2xl shadow p-5 text-center font-semibold">
          ⭐ Trusted Support
        </div>
        <div className="bg-white rounded-2xl shadow p-5 text-center font-semibold">
          💬 Online Help
        </div>
      </section>

      <section id="products" className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold">🔥 Best Sellers</h2>
          <p className="text-slate-500 mt-2">
            Choose your product and complete payment securely.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-3xl shadow p-10 text-center text-slate-500">
            No products available yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product) => {
              const finalPrice = product.promo_price || product.price;
              const discount = getDiscount(
                product.original_price,
                product.promo_price,
                product.price
              );
              const stock = Number(product.stock ?? 999);
              const soldOut = stock <= 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden border hover:shadow-2xl transition"
                >
                  <div className="h-56 bg-gradient-to-br from-slate-900 to-blue-900 text-white flex items-center justify-center relative">
                    {discount && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-extrabold">
                        -{discount}%
                      </div>
                    )}

                    {soldOut && (
                      <div className="absolute top-4 right-4 bg-slate-900 text-white px-3 py-1 rounded-full text-sm font-extrabold">
                        Sold Out
                      </div>
                    )}

                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center px-4">
                        <div className="text-5xl mb-4">💿</div>
                        <div className="text-xl font-bold">
                          {product.title}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                        {product.tag || "Best Seller"}
                      </span>

                      <span className="text-sm text-slate-500">
                        {product.sold_count || 0} sold
                      </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{product.title}</h3>

                    <p className="text-slate-600 text-sm mb-5 min-h-[44px]">
                      {product.description}
                    </p>

                    <div className="mb-5">
                      <p className="text-sm text-slate-400">Special Price</p>

                      <div className="flex items-end gap-3">
                        <p className="text-3xl font-extrabold text-green-600">
                          ${finalPrice}
                        </p>

                        {product.original_price &&
                          product.original_price > finalPrice && (
                            <p className="text-slate-400 line-through font-semibold mb-1">
                              ${product.original_price}
                            </p>
                          )}
                      </div>

                      <div className="text-yellow-500 text-sm mt-2">
                        ⭐⭐⭐⭐⭐
                      </div>

                      <p
                        className={`text-sm font-bold mt-2 ${
                          soldOut ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {soldOut ? "Out of stock" : `Stock: ${stock}`}
                      </p>
                    </div>

                    <Link
                      href={`/product/${product.id}`}
                      className="block text-center bg-white border border-slate-300 text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-50 mb-3"
                    >
                      View Details
                    </Link>

                    {soldOut ? (
                      <button
                        disabled
                        className="block w-full text-center bg-slate-300 text-slate-500 py-4 rounded-xl font-bold cursor-not-allowed"
                      >
                        Sold Out
                      </button>
                    ) : (
                      <Link
                        href={`/payment?product=${encodeURIComponent(
                          product.title
                        )}&amount=${encodeURIComponent(
                          String(finalPrice)
                        )}&quantity=1&type=${encodeURIComponent(
                          product.product_type || "other"
                        )}`}
                        className="block text-center bg-black text-white py-4 rounded-xl font-bold hover:bg-slate-800"
                      >
                        Buy Now
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-white border rounded-3xl p-8 shadow">
          <h2 className="text-2xl font-extrabold mb-4">Need help?</h2>
          <p className="text-slate-600 mb-5">
            Already purchased? Use Track Order to check payment and delivery
            status.
          </p>

          <Link
            href="/track"
            className="inline-block bg-emerald-500 text-black px-6 py-3 rounded-xl font-extrabold"
          >
            Track My Order
          </Link>
        </div>
      </section>

      <a
        href="https://wa.me/"
        target="_blank"
        className="fixed right-6 bottom-6 bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-xl"
      >
        💬
      </a>
    </main>
  );
}
