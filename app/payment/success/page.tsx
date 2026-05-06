"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900 flex items-center justify-center">
      <div className="bg-white border rounded-3xl p-8 shadow-xl max-w-xl w-full text-center">
        <div className="text-6xl mb-5">✅</div>

        <h1 className="text-3xl font-extrabold mb-4">
          Payment Submitted Successfully
        </h1>

        <p className="text-slate-600 mb-6">
          Your payment proof has been submitted. We will verify it manually
          before delivery.
        </p>

        <div className="bg-slate-50 border rounded-2xl p-5 mb-6">
          <p className="text-slate-500 text-sm">Order ID</p>
          <p className="text-2xl font-extrabold text-emerald-600 break-all">
            {orderId}
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Link
            href={`/track?orderId=${encodeURIComponent(orderId)}`}
            className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-extrabold"
          >
            Track Order
          </Link>

          <Link
            href="/"
            className="bg-black text-white px-6 py-3 rounded-xl font-bold"
          >
            Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
