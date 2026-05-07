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
};

function getDiscount(original?: number, promo?: number, price?: number) {
  const finalPrice = promo || price || 0;
  if (!original || original <= finalPrice) return null;
  return Math.round(((original - finalPrice) / original) * 100);
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
    return (
      <main className="min-h-screen bg-slate-100 p-10">
        Loading product...
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-slate-100 p-10">
        Product not found.
      </main>
    );
  }

  const unitPrice = product.promo_price || product.price;
const finalPrice = unitPrice * quantity;
  const discount = getDiscount(
    product.original_price,
    product.promo_price,
    product.price
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between">
          <Link href="/" className="font-extrabold text-xl">
            Digital Software Deals
          </Link>

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

            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-white text-center">
                <div className="text-7xl mb-4">💿</div>
                <div className="text-2xl font-bold">{product.title}</div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mb-4">
            <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-bold">
              {product.tag || "Best Seller"}
            </span>
          </div>

          <h1 className="text-4xl font-extrabold mb-4">{product.title}</h1>

          <p className="text-slate-600 text-lg mb-6">{product.description}</p>

          <div className="bg-white border rounded-3xl p-6 shadow mb-6">
            <p className="text-slate-500 mb-1">Special Price</p>

            <div className="flex items-end gap-4">
              <p className="text-5xl font-extrabold text-green-600">
                ${finalPrice}
              </p>

              {product.original_price && product.original_price > finalPrice && (
                <p className="text-2xl text-slate-400 line-through mb-2">
                  ${product.original_price}
                </p>
              )}
            </div>

            <div className="mt-4 flex gap-4 text-sm text-slate-600">
              <span>⭐⭐⭐⭐⭐ 5.0</span>
              <div className="mt-6">
  <p className="text-slate-500 mb-2 font-semibold">Quantity</p>

  <div className="flex items-center gap-4">
    <button
      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
      className="w-12 h-12 rounded-xl border bg-white text-2xl font-bold"
    >
      -
    </button>

    <div className="text-2xl font-extrabold w-12 text-center">
      {quantity}
    </div>

    <button
      onClick={() => setQuantity((q) => q + 1)}
      className="w-12 h-12 rounded-xl border bg-white text-2xl font-bold"
    >
      +
    </button>
  </div>

  <div className="mt-4 text-lg font-bold text-green-600">
    Total: ${finalPrice.toFixed(2)}
  </div>
</div>
              <span>{product.sold_count || 0} sold</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <Benefit text="Fast processing" />
            <Benefit text="Payment verified" />
            <Benefit text="Order tracking" />
            <Benefit text="After-sales support" />
          </div>

          <Link
         href={`/payment?product=${encodeURIComponent(
  product.title
)}&amount=${encodeURIComponent(
  String(finalPrice)
)}&quantity=${quantity}&type=${encodeURIComponent(
  product.product_type || "other"
)}`}
            className="block text-center bg-black text-white py-5 rounded-2xl font-extrabold text-lg hover:bg-slate-800"
          >
            Buy Now
          </Link>

          <Link
            href="/track"
            className="block text-center mt-3 bg-white border py-4 rounded-2xl font-bold hover:bg-slate-50"
          >
            Track Existing Order
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-3 gap-6">
        <InfoCard
          title="How delivery works"
          text="After payment verification, your order will be processed and delivery details will be available in Track Order."
        />
        <InfoCard
          title="Activation support"
          text="For key products, if activation requires phone activation, submit your Installation ID in Track Order."
        />
        <InfoCard
          title="Tutorial included"
          text="For supported products, usage or activation tutorials will be provided after purchase."
        />
      </section>
    </main>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <div className="bg-white border rounded-2xl p-4 font-semibold">
      ✅ {text}
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white border rounded-3xl p-6 shadow">
      <h3 className="text-xl font-extrabold mb-3">{title}</h3>
      <p className="text-slate-600">{text}</p>
    </div>
  );
}
