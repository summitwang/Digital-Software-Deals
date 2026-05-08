"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

function money(value: number) {
  return value.toFixed(2);
}

function getDiscount(original?: number, promo?: number, price?: number) {
  const unitPrice = promo || price || 0;
  if (!original || original <= unitPrice) return null;
  return Math.round(((original - unitPrice) / original) * 100);
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = String(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data.product || null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <main className="min-h-screen bg-slate-100 p-10">Loading...</main>;
  }

  if (!product) {
    return <main className="min-h-screen bg-slate-100 p-10">Product not found.</main>;
  }

  const stock = Number(product.stock ?? 999);
  const soldOut = stock <= 0;
  const unitPrice = Number(product.promo_price || product.price || 0);
  const totalPrice = unitPrice * quantity;
  const discount = getDiscount(product.original_price, product.promo_price, product.price);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between">
          <Link href="/" className="font-extrabold text-xl">SoftDealsHub</Link>
          <div className="flex gap-5 text-sm font-semibold">
            <Link href="/">Home</Link>
            <Link href="/track">Track Order</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-10">
        <div className="bg-white rounded-3xl shadow overflow-hidden border">
          <div className="h-[420px] bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center relative">
            {discount && (
              <div className="absolute top-5 left-5 bg-red-500 text-white px-4 py-2 rounded-full font-extrabold">
                -{discount}%
              </div>
            )}

            {soldOut && (
              <div className="absolute top-5 right-5 bg-black text-white px-4 py-2 rounded-full font-extrabold">
                Sold Out
              </div>
            )}

            {product.image_url ? (
              <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-white text-center">
                <div className="text-7xl mb-4">💿</div>
                <div className="text-2xl font-bold">{product.title}</div>
              </div>
            )}
          </div>
        </div>

        <div>
          <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-bold">
            {product.tag || "Best Seller"}
          </span>

          <h1 className="text-4xl font-extrabold my-4">{product.title}</h1>
          <p className="text-slate-600 text-lg mb-6">{product.description}</p>

          <div className="bg-white border rounded-3xl p-6 shadow mb-6">
            <p className="text-slate-500 mb-1">Unit Price</p>

            <div className="flex items-end gap-4">
              <p className="text-5xl font-extrabold text-green-600">${money(unitPrice)}</p>

              {product.original_price && product.original_price > unitPrice && (
                <p className="text-2xl text-slate-400 line-through mb-2">
                  ${money(Number(product.original_price))}
                </p>
              )}
            </div>

            <div className="mt-4 flex gap-4 text-sm text-slate-600">
              <span>⭐⭐⭐⭐⭐ 5.0</span>
              <span>{product.sold_count || 0} sold</span>
            </div>

            <p className={`mt-4 font-bold ${soldOut ? "text-red-600" : "text-emerald-600"}`}>
              {soldOut ? "Out of stock" : `Stock available: ${stock}`}
            </p>

            <div className="mt-6">
              <p className="text-slate-500 mb-2 font-semibold">Quantity</p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={soldOut}
                  className="w-12 h-12 rounded-xl border bg-white text-2xl font-bold disabled:bg-slate-200"
                >
                  -
                </button>

                <div className="text-2xl font-extrabold w-12 text-center">{quantity}</div>

                <button
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  disabled={soldOut || quantity >= stock}
                  className="w-12 h-12 rounded-xl border bg-white text-2xl font-bold disabled:bg-slate-200 disabled:text-slate-400"
                >
                  +
                </button>
              </div>

              {quantity >= stock && !soldOut && (
                <p className="text-sm text-red-600 mt-2">Maximum available stock reached.</p>
              )}

              <div className="mt-4 text-lg font-bold text-green-600">
                Total: ${money(totalPrice)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <Benefit text="Fast processing" />
            <Benefit text="Payment verified" />
            <Benefit text="Order tracking" />
            <Benefit text="After-sales support" />
          </div>

          {soldOut ? (
            <button
              disabled
              className="block w-full text-center bg-slate-300 text-slate-500 py-5 rounded-2xl font-extrabold text-lg cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : (
            <Link
              href={`/payment?product=${encodeURIComponent(
                product.title
              )}&amount=${encodeURIComponent(
                money(totalPrice)
              )}&quantity=${quantity}&stock=${stock}&type=${encodeURIComponent(
                product.product_type || "other"
              )}`}
              className="block text-center bg-black text-white py-5 rounded-2xl font-extrabold text-lg hover:bg-slate-800"
            >
              Buy Now
            </Link>
          )}

          <Link href="/track" className="block text-center mt-3 bg-white border py-4 rounded-2xl font-bold hover:bg-slate-50">
            Track Existing Order
          </Link>
        </div>
      </section>
    </main>
  );
}

function Benefit({ text }: { text: string }) {
  return <div className="bg-white border rounded-2xl p-4 font-semibold">✅ {text}</div>;
}
