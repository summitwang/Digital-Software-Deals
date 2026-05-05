"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "Your order";

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-white/10 border border-white/10 rounded-3xl p-8 text-center">
        <div className="text-5xl mb-4">✅</div>

        <h1 className="text-3xl font-bold mb-3">
          Payment Submitted Successfully
        </h1>

        <p className="text-slate-300 mb-6">
          Thank you. Your order has been submitted and is waiting for manual
          verification.
        </p>

        <div className="bg-black/30 rounded-2xl p-4 mb-6">
          <p className="text-sm text-slate-400">Order ID</p>
          <p className="text-xl font-bold text-emerald-400">{orderId}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/track?orderId=${encodeURIComponent(orderId)}`}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl"
          >
            Track Order
          </Link>

          <Link
            href="/"
            className="bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-3 rounded-xl"
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
    <Suspense fallback={<div className="p-10 text-white">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}