"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function TrackContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-white/10 border border-white/10 rounded-3xl p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Track Your Order</h1>

        {orderId ? (
          <div className="bg-black/30 rounded-2xl p-4">
            <p className="text-slate-400 text-sm">Order ID</p>
            <p className="text-xl font-bold text-emerald-400">
              {orderId}
            </p>
          </div>
        ) : (
          <p className="text-slate-400">No order ID found.</p>
        )}
      </div>
    </main>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-10 text-white">Loading...</div>}>
      <TrackContent />
    </Suspense>
  );
}