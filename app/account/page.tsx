"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

type Order = {
  order_no: string;
  product: string;
  amount: number;
  quantity?: number;
  status: string;
  created_at: string;
};

export default function AccountPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAccount() {
    const { data: sessionData } = await supabaseClient.auth.getSession();

    const session = sessionData.session;

    if (!session) {
      router.push("/account/login");
      return;
    }

    setEmail(session.user.email || "");

    const res = await fetch("/api/customer-orders", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = await res.json();

    if (res.ok) {
      setOrders(data.orders || []);
    }

    setLoading(false);
  }

  async function logout() {
    await supabaseClient.auth.signOut();
    router.push("/");
  }

  useEffect(() => {
    loadAccount();
  }, []);

  if (loading) {
    return <main className="p-10">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-blue-600 font-semibold">
              ← Back Home
            </Link>
            <h1 className="text-3xl font-extrabold mt-4">My Account</h1>
            <p className="text-slate-600 mt-1">{email}</p>
          </div>

          <button
            onClick={logout}
            className="bg-black text-white px-5 py-3 rounded-xl font-bold"
          >
            Logout
          </button>
        </div>

        <section className="bg-white border rounded-3xl p-6 shadow">
          <h2 className="text-2xl font-bold mb-5">My Orders</h2>

          {orders.length === 0 ? (
            <p className="text-slate-500">No orders found for this email.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.order_no} className="border rounded-2xl p-5">
                  <div className="flex flex-col md:flex-row md:justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">Order ID</p>
                      <p className="text-xl font-extrabold text-emerald-600">
                        {order.order_no}
                      </p>
                    </div>

                    <Link
                      href={`/track?orderId=${order.order_no}`}
                      className="bg-emerald-500 text-black px-5 py-3 rounded-xl font-bold text-center"
                    >
                      Track Order
                    </Link>
                  </div>

                  <div className="grid md:grid-cols-4 gap-3 mt-4">
                    <Info label="Product" value={order.product} />
                    <Info label="Amount" value={`$${order.amount} USDT`} />
                    <Info label="Quantity" value={String(order.quantity || 1)} />
                    <Info label="Status" value={order.status} />
                  </div>

                  <p className="text-sm text-slate-500 mt-3">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 border rounded-xl p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-bold break-all">{value}</p>
    </div>
  );
}
