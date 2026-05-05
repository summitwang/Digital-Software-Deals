import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

type Order = {
  id: string;
  status?: string;
  licenseKey?: string;
  activationType?: string;
  installationId?: string;
  installationImage?: string;
  confirmationId?: string;
  deliveryNote?: string;
  createdAt: string;
};

const filePath = path.join(process.cwd(), "data", "orders.json");

async function readOrders(): Promise<Order[]> {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeOrders(orders: Order[]) {
  await fs.writeFile(filePath, JSON.stringify(orders, null, 2));
}

export async function POST(request: Request) {
  const body = await request.json();
  const orderId = body.orderId;

  if (!orderId) {
    return NextResponse.json(
      { success: false, message: "Order ID required" },
      { status: 400 }
    );
  }

  const orders = await readOrders();
  const order = orders.find((item) => item.id === orderId);

  if (!order) {
    return NextResponse.json(
      { success: false, message: "Order not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    order,
  });
}

export async function PATCH(request: Request) {
  const body = await request.json();

  if (!body.orderId) {
    return NextResponse.json(
      { success: false, message: "Order ID required" },
      { status: 400 }
    );
  }

  if (!body.installationId && !body.installationImage) {
    return NextResponse.json(
      {
        success: false,
        message: "Installation ID or screenshot is required",
      },
      { status: 400 }
    );
  }

  const orders = await readOrders();

  const updatedOrders = orders.map((order) => {
    if (order.id !== body.orderId) return order;

    return {
  ...order,
  installationId: body.installationId || order.installationId || "",
  installationImage: body.installationImage || order.installationImage || "",
  confirmationId: "",
  status: "Waiting Confirmation ID", // ✅ 改这里
};
  });

  await writeOrders(updatedOrders);

  return NextResponse.json({ success: true });
}