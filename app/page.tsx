"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  title: string;
  price: string;
  image: string;
  sales?: number;
};

type Review = {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    loadData();

    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const diff = end.getTime() - now.getTime();
      const h = Math.floor(diff / 1000 / 60 / 60);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  async function loadData() {
    const productRes = await fetch("/api/products");
    const productData = await productRes.json();
    setProducts(productData);

    const reviewRes = await fetch("/api/reviews");
    const reviewData = await reviewRes.json();
    setReviews(reviewData);
  }

  const hotProducts = products.slice(0, 6);
  const previewReviews = reviews.slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-r from-black via-slate-900 to-black text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-5">
              🔥 Today Deal Ends In {timeLeft}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-5">
              Digital Software Deals
            </h1>

            <p className="text-slate-300 text-lg mb-8">
              Windows, Office, Adobe and Autodesk products with order tracking
              and after-sales support.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="bg-white text-black px-7 py-4 rounded-xl font-bold"
              >
                Shop Now
              </Link>

              <Link
                href="/track"
                className="border border-white px-7 py-4 rounded-xl"
              >
                Track Order
              </Link>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-4">Why customers choose us</h2>
            <div className="space-y-3 text-sm text-slate-200">
              <p>✅ Fast order processing</p>
              <p>✅ Multiple product types supported</p>
              <p>✅ Customer order tracking</p>
              <p>✅ Support after purchase</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-4 gap-4 text-center">
        <div className="bg-white p-5 rounded-2xl shadow">⚡ Fast Delivery</div>
        <div className="bg-white p-5 rounded-2xl shadow">🔒 Secure Payment</div>
        <div className="bg-white p-5 rounded-2xl shadow">⭐ Reviews</div>
        <div className="bg-white p-5 rounded-2xl shadow">💬 Support</div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">🔥 Best Sellers</h2>

          <Link href="/products" className="text-blue-600">
            View All →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {hotProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl shadow hover:shadow-xl transition border overflow-hidden"
            >
              <Link href={`/products/${product.id}`}>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-slate-100 flex items-center justify-center">
                    Product Image
                  </div>
                )}
              </Link>

              <div className="p-5">
                <div className="flex gap-2 mb-3">
                  <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                    HOT
                  </span>
                  <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
                    Best Seller
                  </span>
                </div>

                <Link
                  href={`/products/${product.id}`}
                  className="font-bold text-lg block mb-3 hover:text-blue-600"
                >
                  {product.title}
                </Link>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-green-600 font-bold text-lg">
                    {product.price}
                  </span>
                  <span className="text-sm text-slate-500">
                    Sold: {product.sales || 0}
                  </span>
                </div>

                <Link
                  href={`/payment?productId=${product.id}`}
                  className="block text-center bg-black text-white py-3 rounded-xl font-semibold"
                >
                  Buy Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-12 mt-8">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Customer Reviews
          </h2>

          {previewReviews.length === 0 ? (
            <p className="text-center text-slate-500">
              Customer reviews will appear here.
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {previewReviews.map((review) => (
                <div key={review.id} className="border p-5 rounded-2xl">
                  <p className="mb-2">{"★".repeat(review.rating)}</p>
                  <p className="text-sm text-slate-700 mb-3">
                    {review.comment}
                  </p>
                  <p className="text-sm font-semibold">— {review.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="bg-black text-white rounded-3xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to complete your order?
          </h2>

          <p className="text-slate-300 mb-6">
            Browse available products and submit your order securely.
          </p>

          <Link
            href="/products"
            className="inline-block bg-white text-black px-8 py-4 rounded-xl font-bold"
          >
            Browse Products
          </Link>
        </div>
      </section>
    </main>
  );
}