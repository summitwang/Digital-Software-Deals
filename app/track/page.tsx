"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type ProductType = "license_key" | "office365_account" | "subscription";

type Order = {
  id: string;
  productType?: ProductType;
  status?: string;

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

export default function TrackPage() {
  const searchParams = useSearchParams();
  const defaultOrderId = searchParams.get("orderId") || "";

  const [orderId, setOrderId] = useState(defaultOrderId);
  const [installationId, setInstallationId] = useState("");
  const [installationFile, setInstallationFile] = useState<File | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittingInstallation, setSubmittingInstallation] = useState(false);

  useEffect(() => {
    if (defaultOrderId) {
      searchOrder(defaultOrderId);
    }
  }, [defaultOrderId]);

  async function searchOrder(customOrderId?: string) {
    const targetOrderId = customOrderId || orderId;

    if (!targetOrderId.trim()) {
      alert("Enter order ID");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId: targetOrderId }),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Order not found");
      setOrder(null);
    } else {
      setOrder(data.order);
      setOrderId(targetOrderId);
      setInstallationId(data.order.installationId || "");
    }

    setLoading(false);
  }

  async function submitInstallationInfo() {
    if (!order) return;

    if (!installationId.trim() && !installationFile) {
      alert("Please enter Installation ID or upload a screenshot.");
      return;
    }

    setSubmittingInstallation(true);

    let installationImage = order.installationImage || "";

    if (installationFile) {
      const formData = new FormData();
      formData.append("file", installationFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        alert("Image upload failed.");
        setSubmittingInstallation(false);
        return;
      }

      installationImage = uploadData.url;
    }

    const res = await fetch("/api/track", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: order.id,
        installationId,
        installationImage,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Installation information submitted successfully.");
      setInstallationFile(null);
      await searchOrder(order.id);
    } else {
      alert(data.message || "Submit failed.");
    }

    setSubmittingInstallation(false);
  }

  const productType = order?.productType || "license_key";
  const status = order?.status || "Pending";

  const canShowKey =
    productType === "license_key" &&
    (status === "Key Sent" ||
      status === "Waiting Installation ID" ||
      status === "Waiting Confirmation ID" ||
      status === "Confirmation ID Sent" ||
      status === "Completed");

  const canSubmitInstallation =
    productType === "license_key" &&
    (status === "Key Sent" ||
      status === "Waiting Installation ID" ||
      status === "Waiting Confirmation ID" ||
      status === "Confirmation ID Sent" ||
      status === "Completed");

  const canShowConfirmation =
    productType === "license_key" &&
    (status === "Confirmation ID Sent" || status === "Completed");

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4">Track Your Order</h1>

        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter your Order ID"
          className="w-full p-3 border rounded-xl mb-4"
        />

        <button
          onClick={() => searchOrder()}
          className="w-full bg-black text-white py-3 rounded-xl mb-6"
        >
          {loading ? "Searching..." : "Search"}
        </button>

        {order && (
          <div className="space-y-4 text-sm">
            <p>
              <b>Order ID:</b> {order.id}
            </p>

            <p>
              <b>Status:</b> {status}
            </p>

            {(status === "Pending" || status === "Paid") && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                Your order is being reviewed. Please check back later.
              </div>
            )}

            {productType === "license_key" && canShowKey && order.licenseKey && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                <p className="font-semibold mb-2">License Key</p>
                <p className="break-all">{order.licenseKey}</p>
              </div>
            )}

            {productType === "license_key" && canShowKey && order.licenseKey && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl leading-6">
                <p className="font-semibold mb-2">Activation Guide</p>
                <p>1. Enter the license key into your activation screen.</p>
                <p>2. If activation fails, check the error code.</p>
                <p>3. Some errors may require a replacement key.</p>
                <p>4. Some errors may require Phone Activation.</p>
                <p>
                  5. If Phone Activation is required, submit your Installation ID
                  below.
                </p>
              </div>
            )}

            {status === "Waiting Confirmation ID" && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                Your Installation ID has been received.
                <br />
                We are processing your request and will provide your
                Confirmation ID shortly.
              </div>
            )}

            {canSubmitInstallation && (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl space-y-3">
                <p className="font-semibold">Submit / Update Installation ID</p>

                <textarea
                  value={installationId}
                  onChange={(e) => setInstallationId(e.target.value)}
                  placeholder="Enter your Installation ID here"
                  className="w-full p-3 border rounded-xl min-h-28"
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setInstallationFile(e.target.files?.[0] || null)
                  }
                  className="w-full p-3 border rounded-xl bg-white"
                />

                <button
                  onClick={submitInstallationInfo}
                  className="w-full bg-orange-600 text-white py-3 rounded-xl"
                >
                  {submittingInstallation
                    ? "Submitting..."
                    : "Submit / Update Installation ID"}
                </button>
              </div>
            )}

            {productType === "license_key" && order.installationId && (
              <div className="bg-slate-50 border p-4 rounded-xl">
                <p className="font-semibold mb-2">Submitted Installation ID</p>
                <p className="break-all">{order.installationId}</p>
              </div>
            )}

            {productType === "license_key" && order.installationImage && (
              <div className="bg-slate-50 border p-4 rounded-xl">
                <p className="font-semibold mb-2">
                  Submitted Installation ID Screenshot
                </p>
                <img
                  src={order.installationImage}
                  alt="Installation ID screenshot"
                  className="w-56 border rounded-xl"
                />
              </div>
            )}

            {productType === "license_key" &&
              canShowConfirmation &&
              order.confirmationId && (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
                  <p className="font-semibold mb-2">Confirmation ID</p>
                  <p className="break-all">{order.confirmationId}</p>
                </div>
              )}

            {productType === "office365_account" && order.accountEmail && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl space-y-2">
                <p className="font-semibold mb-2">Office 365 Account</p>
                <p>
                  <b>Email:</b> {order.accountEmail}
                </p>
                <p>
                  <b>Password:</b> {order.accountPassword}
                </p>
                {order.loginUrl && (
                  <p>
                    <b>Login URL:</b> {order.loginUrl}
                  </p>
                )}
              </div>
            )}

            {productType === "subscription" && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-2">
                <p className="font-semibold mb-2">Subscription Information</p>

                {order.customerEmail && (
                  <p>
                    <b>Customer Email:</b> {order.customerEmail}
                  </p>
                )}

                {order.subscriptionAccount && (
                  <p>
                    <b>Subscription Account:</b> {order.subscriptionAccount}
                  </p>
                )}

                {order.subscriptionStatus && (
                  <p>
                    <b>Status:</b> {order.subscriptionStatus}
                  </p>
                )}
              </div>
            )}

            {order.deliveryNote && (
              <div className="bg-slate-50 border p-4 rounded-xl">
                <p className="font-semibold mb-2">Note</p>
                <p>{order.deliveryNote}</p>
              </div>
            )}

            <div className="mt-6 border-t pt-4 text-sm">
              <p className="font-semibold mb-2">Need help?</p>

              <a
                href="mailto:support@example.com"
                className="block text-blue-600"
              >
                Email Support
              </a>

              <a
                href="https://wa.me/60168292446"
                target="_blank"
                className="block text-green-600 mt-2"
              >
                WhatsApp Support
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}