"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OrderStatus =
  | "Pending"
  | "Paid"
  | "Key Sent"
  | "Waiting Installation ID"
  | "Waiting Confirmation ID"
  | "Confirmation ID Sent"
  | "Completed";

type ProductType = "license_key" | "office365_account" | "subscription";

type Order = {
  id: string;
  productId?: string;
  product: string;
  productType?: ProductType;
  amount: string;
  name: string;
  email: string;
  address: string;
  txid: string;
  screenshot?: string;
  status?: OrderStatus;
  countedSale?: boolean;

  licenseKey?: string;
  activationType?: string;
  installationId?: string;
  installationImage?: string;
  confirmationId?: string;

  accountEmail?: string;
  accountPassword?: string;
  loginUrl?: string;

  customerEmail?: string;
  subscriptionAccount?: string;
  subscriptionStatus?: string;

  deliveryNote?: string;
  createdAt: string;
};

export default function OrdersPage() {
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [seenOrderIds, setSeenOrderIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("seenOrderIds");
    if (saved) {
      setSeenOrderIds(JSON.parse(saved));
    }

    checkLogin();
  }, []);

  async function checkLogin() {
    const res = await fetch("/api/admin/check");
    const data = await res.json();

    setIsLogin(data.isLogin);
    setChecking(false);

    if (data.isLogin) {
      loadOrders();
    }
  }

  async function login() {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (data.success) {
      setIsLogin(true);
      loadOrders();
    } else {
      alert("Wrong password");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    setIsLogin(false);
    setOrders([]);
  }

  async function loadOrders() {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data);
  }

  async function saveOrder(orderId: string, data: Partial<Order>) {
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: orderId,
        ...data,
      }),
    });

    const result = await res.json();

    if (result.success) {
      alert("Saved successfully.");
      await loadOrders();
    } else {
      alert("Save failed.");
    }
  }

  async function clearOrders() {
    if (!confirm("Are you sure you want to clear all orders?")) return;

    await fetch("/api/orders", {
      method: "DELETE",
    });

    setOrders([]);
  }

  function getStatus(order: Order): OrderStatus {
    return order.status || "Pending";
  }

  function markAllSeen() {
    const ids = orders.map((order) => order.id);
    setSeenOrderIds(ids);
    localStorage.setItem("seenOrderIds", JSON.stringify(ids));
  }

  const newOrders = orders.filter(
    (order) => getStatus(order) === "Pending" && !seenOrderIds.includes(order.id)
  );

  const waitingConfirmationOrders = orders.filter(
    (order) => getStatus(order) === "Waiting Confirmation ID"
  );

  const paidOrders = orders.filter((order) => getStatus(order) === "Paid");

  const completedOrders = orders.filter(
    (order) => getStatus(order) === "Completed"
  );

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        Loading...
      </main>
    );
  }

  if (!isLogin) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-4">Admin Login</h1>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full p-3 border rounded-xl mb-4"
          />

          <button
            onClick={login}
            className="w-full bg-black text-white py-3 rounded-xl"
          >
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <Link href="/" className="text-blue-600">
              ← Back Home
            </Link>

            <Link href="/admin-products" className="text-blue-600">
              Product Admin
            </Link>
          </div>

          <button onClick={logout} className="text-red-600">
            Logout
          </button>
        </div>

        <div className="flex justify-between items-center mt-8 mb-6">
          <h1 className="text-3xl font-bold">Orders</h1>

          <div className="flex gap-3">
            <button
              onClick={markAllSeen}
              className="bg-slate-800 text-white px-4 py-2 rounded-xl"
            >
              Mark All Seen
            </button>

            <button
              onClick={clearOrders}
              className="bg-red-500 text-white px-4 py-2 rounded-xl"
            >
              Clear Orders
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl shadow">
            <p className="text-sm text-red-700">New Orders</p>
            <p className="text-3xl font-bold text-red-600">
              {newOrders.length}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 p-4 rounded-2xl shadow">
            <p className="text-sm text-green-700">Paid</p>
            <p className="text-3xl font-bold text-green-600">
              {paidOrders.length}
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl shadow">
            <p className="text-sm text-orange-700">Need Confirmation ID</p>
            <p className="text-3xl font-bold text-orange-600">
              {waitingConfirmationOrders.length}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl shadow">
            <p className="text-sm text-blue-700">Completed</p>
            <p className="text-3xl font-bold text-blue-600">
              {completedOrders.length}
            </p>
          </div>
        </div>

        {newOrders.length > 0 && (
          <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-2xl mb-6 font-semibold">
            🔔 You have {newOrders.length} new pending order(s).
          </div>
        )}

        {waitingConfirmationOrders.length > 0 && (
          <div className="bg-orange-100 border border-orange-300 text-orange-800 p-4 rounded-2xl mb-6 font-semibold">
            ⚠ {waitingConfirmationOrders.length} order(s) need Confirmation ID.
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow">No orders yet.</div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                status={getStatus(order)}
                isNew={
                  getStatus(order) === "Pending" &&
                  !seenOrderIds.includes(order.id)
                }
                onSave={saveOrder}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function OrderCard({
  order,
  status,
  isNew,
  onSave,
}: {
  order: Order;
  status: OrderStatus;
  isNew: boolean;
  onSave: (orderId: string, data: Partial<Order>) => Promise<void>;
}) {
  const [productType, setProductType] = useState<ProductType>(
    order.productType || "license_key"
  );

  const [licenseKey, setLicenseKey] = useState(order.licenseKey || "");
  const [activationType, setActivationType] = useState(
    order.activationType || "Direct Key"
  );
  const [installationId, setInstallationId] = useState(
    order.installationId || ""
  );
  const [confirmationId, setConfirmationId] = useState(
    order.confirmationId || ""
  );

  const [accountEmail, setAccountEmail] = useState(order.accountEmail || "");
  const [accountPassword, setAccountPassword] = useState(
    order.accountPassword || ""
  );
  const [loginUrl, setLoginUrl] = useState(order.loginUrl || "");

  const [customerEmail, setCustomerEmail] = useState(order.customerEmail || "");
  const [subscriptionAccount, setSubscriptionAccount] = useState(
    order.subscriptionAccount || ""
  );
  const [subscriptionStatus, setSubscriptionStatus] = useState(
    order.subscriptionStatus || ""
  );

  const [deliveryNote, setDeliveryNote] = useState(order.deliveryNote || "");
  const [newStatus, setNewStatus] = useState<OrderStatus>(status);

  const needConfirmation = status === "Waiting Confirmation ID";

  async function saveDelivery() {
    await onSave(order.id, {
      status: newStatus,
      productType,

      licenseKey,
      activationType,
      installationId,
      confirmationId,

      accountEmail,
      accountPassword,
      loginUrl,

      customerEmail,
      subscriptionAccount,
      subscriptionStatus,

      deliveryNote,
    });
  }

  async function quickSave(statusValue: OrderStatus) {
    await onSave(order.id, {
      status: statusValue,
      productType,

      licenseKey,
      activationType,
      installationId,
      confirmationId,

      accountEmail,
      accountPassword,
      loginUrl,

      customerEmail,
      subscriptionAccount,
      subscriptionStatus,

      deliveryNote,
    });
  }

  return (
    <div
      className={`rounded-2xl p-6 shadow border ${
        needConfirmation
          ? "bg-orange-50 border-orange-300"
          : isNew
          ? "bg-red-50 border-red-300"
          : "bg-white border-transparent"
      }`}
    >
      {isNew && (
        <div className="mb-4 bg-red-100 border border-red-300 text-red-800 p-3 rounded-xl font-semibold">
          🔔 New pending order. Please verify payment.
        </div>
      )}

      {needConfirmation && (
        <div className="mb-4 bg-orange-100 border border-orange-300 text-orange-800 p-3 rounded-xl font-semibold">
          ⚠ Customer submitted Installation ID. Confirmation ID is needed.
        </div>
      )}

      <div className="flex justify-between gap-4 mb-4">
        <div>
          <p className="font-bold text-lg">{order.id}</p>
          <p className="text-sm text-slate-500">{order.createdAt}</p>
        </div>

        <div className="text-right">
          <p className="text-sm text-slate-500">Status</p>
          <p
            className={`font-bold ${
              status === "Pending"
                ? "text-yellow-600"
                : status === "Paid"
                ? "text-green-600"
                : status === "Waiting Confirmation ID"
                ? "text-orange-600"
                : status === "Completed"
                ? "text-blue-600"
                : "text-purple-600"
            }`}
          >
            {status}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <p>
          <b>Product:</b> {order.product}
        </p>
        <p>
          <b>Amount:</b> {order.amount}
        </p>
        <p>
          <b>Name:</b> {order.name}
        </p>
        <p>
          <b>Email:</b> {order.email}
        </p>
        <p>
          <b>Address:</b> {order.address}
        </p>
        <p className="break-all">
          <b>TXID:</b> {order.txid}
        </p>
      </div>

      {order.screenshot && (
        <div className="mt-4">
          <p className="text-sm font-semibold mb-2">Payment Screenshot:</p>
          <img
            src={order.screenshot}
            alt="Payment screenshot"
            className="w-48 border rounded-xl"
          />
        </div>
      )}

      {order.installationId && (
        <div className="mt-4 bg-slate-50 border p-4 rounded-xl">
          <p className="text-sm font-semibold mb-2">
            Submitted Installation ID:
          </p>
          <p className="break-all text-sm">{order.installationId}</p>
        </div>
      )}

      {order.installationImage && (
        <div className="mt-4">
          <p className="text-sm font-semibold mb-2">
            Installation ID Screenshot:
          </p>
          <img
            src={order.installationImage}
            alt="Installation ID screenshot"
            className="w-56 border rounded-xl"
          />
        </div>
      )}

      <div className="mt-6 border-t pt-5 space-y-4">
        <h2 className="font-bold text-lg">Delivery Information</h2>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => quickSave("Paid")}
            className="bg-green-600 text-white px-4 py-2 rounded-xl"
          >
            Confirm Paid
          </button>

          <button
            onClick={() => quickSave("Key Sent")}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            Send Key
          </button>

          <button
            onClick={() => quickSave("Waiting Installation ID")}
            className="bg-yellow-500 text-white px-4 py-2 rounded-xl"
          >
            Need Installation ID
          </button>

          <button
            onClick={() => quickSave("Confirmation ID Sent")}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl"
          >
            Send Confirmation ID
          </button>

          <button
            onClick={() => quickSave("Completed")}
            className="bg-black text-white px-4 py-2 rounded-xl"
          >
            Complete
          </button>
        </div>

        <div>
          <p className="text-sm font-semibold mb-1">Product Type</p>
          <select
            value={productType}
            onChange={(e) => setProductType(e.target.value as ProductType)}
            className="w-full p-3 border rounded-xl"
          >
            <option value="license_key">Windows / Office Key</option>
            <option value="office365_account">Office 365 Account</option>
            <option value="subscription">Adobe / Autodesk Subscription</option>
          </select>
        </div>

        <div>
          <p className="text-sm font-semibold mb-1">Status</p>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
            className="w-full p-3 border rounded-xl"
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Key Sent">Key Sent</option>
            <option value="Waiting Installation ID">
              Waiting Installation ID
            </option>
            <option value="Waiting Confirmation ID">
              Waiting Confirmation ID
            </option>
            <option value="Confirmation ID Sent">
              Confirmation ID Sent
            </option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {productType === "license_key" && (
          <>
            <div>
              <p className="text-sm font-semibold mb-1">Activation Type</p>
              <select
                value={activationType}
                onChange={(e) => setActivationType(e.target.value)}
                className="w-full p-3 border rounded-xl"
              >
                <option value="Direct Key">Direct Key</option>
                <option value="Phone Activation">Phone Activation</option>
                <option value="Reusable Key">Reusable Key</option>
              </select>
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">License Key</p>
              <input
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="Enter license key"
                className="w-full p-3 border rounded-xl"
              />
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">Installation ID</p>
              <input
                value={installationId}
                onChange={(e) => setInstallationId(e.target.value)}
                placeholder="Customer installation ID"
                className="w-full p-3 border rounded-xl"
              />
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">Confirmation ID</p>
              <input
                value={confirmationId}
                onChange={(e) => setConfirmationId(e.target.value)}
                placeholder="Confirmation ID"
                className="w-full p-3 border rounded-xl"
              />
            </div>
          </>
        )}

        {productType === "office365_account" && (
          <>
            <div>
              <p className="text-sm font-semibold mb-1">Account Email</p>
              <input
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                placeholder="Office 365 account email"
                className="w-full p-3 border rounded-xl"
              />
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">Account Password</p>
              <input
                value={accountPassword}
                onChange={(e) => setAccountPassword(e.target.value)}
                placeholder="Office 365 account password"
                className="w-full p-3 border rounded-xl"
              />
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">Login URL</p>
              <input
                value={loginUrl}
                onChange={(e) => setLoginUrl(e.target.value)}
                placeholder="https://www.office.com"
                className="w-full p-3 border rounded-xl"
              />
            </div>
          </>
        )}

        {productType === "subscription" && (
          <>
            <div>
              <p className="text-sm font-semibold mb-1">Customer Email</p>
              <input
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Customer email for subscription"
                className="w-full p-3 border rounded-xl"
              />
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">Subscription Account</p>
              <input
                value={subscriptionAccount}
                onChange={(e) => setSubscriptionAccount(e.target.value)}
                placeholder="Subscription account / admin account"
                className="w-full p-3 border rounded-xl"
              />
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">Subscription Status</p>
              <input
                value={subscriptionStatus}
                onChange={(e) => setSubscriptionStatus(e.target.value)}
                placeholder="Activated / Pending / Invited"
                className="w-full p-3 border rounded-xl"
              />
            </div>
          </>
        )}

        <div>
          <p className="text-sm font-semibold mb-1">Delivery Note</p>
          <textarea
            value={deliveryNote}
            onChange={(e) => setDeliveryNote(e.target.value)}
            placeholder="Activation note, download link, delivery instructions..."
            className="w-full p-3 border rounded-xl min-h-24"
          />
        </div>

        <button
          onClick={saveDelivery}
          className="bg-slate-800 text-white px-5 py-3 rounded-xl"
        >
          Save Delivery Info
        </button>
      </div>
    </div>
  );
}