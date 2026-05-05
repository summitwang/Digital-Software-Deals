"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ✅ 正确读取 URL 参数
  const product = searchParams.get("product") || "Unknown Product";
  const amount = searchParams.get("amount") || "0";

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    address: "",
    txid: "",
  });

  async function submitOrder() {
    if (!form.customer_email || !form.txid) {
      alert("Please enter email and transaction ID");
      return;
    }

    const res = await fetch("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        product,
        amount,
        ...form,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Submit failed");
      return;
    }

    // ✅ 跳转成功页
    router.push(`/payment/success?orderId=${data.order.order_no}`);
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>USDT TRC20 Payment</h1>

      <div style={{ marginTop: 20 }}>
        <p><strong>Product:</strong> {product}</p>
        <p><strong>Amount:</strong> ${amount} USDT</p>
        <p><strong>Network:</strong> TRC20</p>
      </div>

      <div style={{ marginTop: 20 }}>
        <p><strong>Wallet Address:</strong></p>
        <p style={{ wordBreak: "break-all" }}>
          👉 这里换成你的USDT地址
        </p>
      </div>

      <h3 style={{ marginTop: 30 }}>Submit Your Order</h3>

      <div style={{ marginTop: 10 }}>
        <input
          placeholder="Your Name"
          value={form.customer_name}
          onChange={(e) =>
            setForm({ ...form, customer_name: e.target.value })
          }
        />
        <br /><br />

        <input
          placeholder="Email"
          value={form.customer_email}
          onChange={(e) =>
            setForm({ ...form, customer_email: e.target.value })
          }
        />
        <br /><br />

        <input
          placeholder="Notes / Account Info"
          value={form.address}
          onChange={(e) =>
            setForm({ ...form, address: e.target.value })
          }
        />
        <br /><br />

        <input
          placeholder="Transaction ID (TxID)"
          value={form.txid}
          onChange={(e) =>
            setForm({ ...form, txid: e.target.value })
          }
        />
        <br /><br />

        <button onClick={submitOrder}>
          Submit Payment
        </button>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
