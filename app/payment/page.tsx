"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Product = {
  id: string;
  title: string;
  price: string;
  productType: string;
  image: string;
  description: string;
  sales: number;
};

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const walletAddress = "TTmc9PhAioNeRVdh5Nb9TZ7WCJ6dqDZH4o";

  const [product, setProduct] = useState("Windows 11 Pro Key");
  const [amount, setAmount] = useState("49.99 USDT");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [txid, setTxid] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [submittedOrderId, setSubmittedOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;

      const res = await fetch("/api/products");
      const products: Product[] = await res.json();

      const found = products.find((item) => item.id === productId);

      if (found) {
        setSelectedProduct(found);
        setProduct(found.title);
        setAmount(found.price);
      }
    }

    loadProduct();
  }, [productId]);

  async function submitOrder() {
    if (!name.trim() || !email.trim() || !address.trim() || !txid.trim() || !file) {
      alert("Please fill all fields and upload screenshot.");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();

    if (!uploadData.success) {
      alert("Upload failed.");
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: selectedProduct?.id,
        product,
        productType: selectedProduct?.productType,
        amount,
        name,
        email,
        address,
        txid,
        screenshot: uploadData.url,
      }),
    });

    const data = await res.json();

    if (data.success) {
      const orderId = data.order.id;
      router.push(`/payment/success?orderId=${orderId}`);

      setName("");
      setEmail("");
      setAddress("");
      setTxid("");
      setFile(null);
    } else {
      alert("Submit failed.");
    }

    setSubmitting(false);
  }

  function copyOrderId() {
    if (!submittedOrderId) return;

    navigator.clipboard.writeText(submittedOrderId);
    alert("Order ID copied!");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/products" className="text-blue-600">
          ← Back to Products
        </Link>

        <div className="bg-white rounded-3xl shadow p-8 mt-8">
          <h1 className="text-3xl font-bold mb-4">USDT TRC20 Payment</h1>

          {submittedOrderId && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-5">
              <h2 className="text-xl font-bold text-green-700 mb-2">
                Order Submitted Successfully
              </h2>

              <p className="text-sm text-green-800 mb-3">
                Please save your order number. You will need it to track your
                order and receive delivery information.
              </p>

              <div className="bg-white border rounded-xl p-4 mb-4">
                <p className="text-sm text-slate-500 mb-1">Your Order ID</p>
                <p className="font-bold text-lg break-all">
                  {submittedOrderId}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={copyOrderId}
                  className="bg-green-600 text-white px-5 py-3 rounded-xl"
                >
                  Copy Order ID
                </button>

                <Link
                  href="/track"
                  className="bg-black text-white px-5 py-3 rounded-xl"
                >
                  Track Order
                </Link>

                <Link
                  href="/products"
                  className="border px-5 py-3 rounded-xl"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}

          {selectedProduct && (
            <div className="mb-6 border rounded-2xl p-4 bg-slate-50">
              <p className="text-sm text-slate-500 mb-1">Selected Product</p>
              <p className="font-bold text-lg">{selectedProduct.title}</p>
              <p className="text-blue-600 font-bold mt-1">
                {selectedProduct.price}
              </p>
            </div>
          )}

          {!selectedProduct && (
            <div className="mb-6 border rounded-2xl p-4 bg-yellow-50">
              <p className="text-sm text-yellow-700">
                No product selected. Default product is used.
              </p>
            </div>
          )}

          <p className="text-slate-600 mb-6">
            Please send the exact amount using TRC20 network.
          </p>

          <div className="space-y-5">
            <div>
              <p className="font-semibold mb-2">Product</p>
              <div className="bg-slate-100 p-4 rounded-xl break-all">
                {product}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-2">Amount</p>
              <div className="bg-slate-100 p-4 rounded-xl">{amount}</div>
            </div>

            <div>
              <p className="font-semibold mb-2">Network</p>
              <div className="bg-slate-100 p-4 rounded-xl">TRC20 (USDT)</div>
            </div>

            <div>
              <p className="font-semibold mb-2">Wallet Address</p>
              <div className="bg-slate-100 p-4 rounded-xl break-all">
                {walletAddress}
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(walletAddress);
                alert("Address copied!");
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl"
            >
              Copy Address
            </button>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-sm">
              ⚠ Only send via TRC20 network. Please upload payment screenshot
              after payment.
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-bold">Submit Your Order</h2>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full p-3 border rounded-xl"
              />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full p-3 border rounded-xl"
              />

              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shipping Address / Order Note"
                className="w-full p-3 border rounded-xl"
              />

              <input
                value={txid}
                onChange={(e) => setTxid(e.target.value)}
                placeholder="Transaction Hash (TXID)"
                className="w-full p-3 border rounded-xl"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full p-3 border rounded-xl"
              />

              <button
                onClick={submitOrder}
                disabled={submitting}
                className="w-full bg-black text-white py-3 rounded-xl disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Order"}
              </button>
            </div>

            <Link href="/track" className="inline-block text-blue-600 mt-4">
              Track Order →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}