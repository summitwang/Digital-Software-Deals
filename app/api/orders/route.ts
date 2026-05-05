import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";

export const runtime = "nodejs";

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
  status: string;
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

type Product = {
  id: string;
  title: string;
  price: string;
  productType: ProductType;
  image: string;
  description: string;
  sales: number;
  createdAt: string;
};

const ordersPath = path.join(process.cwd(), "data", "orders.json");
const productsPath = path.join(process.cwd(), "data", "products.json");

function detectProductType(productName: string): ProductType {
  const name = productName.toLowerCase();

  if (
    name.includes("office 365") ||
    name.includes("microsoft 365") ||
    name.includes("office365") ||
    name.includes("365") ||
    name.includes("onedrive") ||
    name.includes("one drive")
  ) {
    return "office365_account";
  }

  if (
    name.includes("adobe") ||
    name.includes("photoshop") ||
    name.includes("illustrator") ||
    name.includes("premiere") ||
    name.includes("after effects") ||
    name.includes("autodesk") ||
    name.includes("autocad") ||
    name.includes("3ds max") ||
    name.includes("3dsmax") ||
    name.includes("maya") ||
    name.includes("revit")
  ) {
    return "subscription";
  }

  return "license_key";
}

async function isAdminLogin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_login")?.value === "yes";
}

async function readOrders(): Promise<Order[]> {
  try {
    const data = await fs.readFile(ordersPath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeOrders(orders: Order[]) {
  await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2));
}

async function readProducts(): Promise<Product[]> {
  try {
    const data = await fs.readFile(productsPath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeProducts(products: Product[]) {
  await fs.writeFile(productsPath, JSON.stringify(products, null, 2));
}

async function increaseProductSales(productId?: string) {
  if (!productId) return;

  const products = await readProducts();

  const updatedProducts = products.map((product) => {
    if (product.id !== productId) return product;

    return {
      ...product,
      sales: Number(product.sales || 0) + 1,
    };
  });

  await writeProducts(updatedProducts);
}

export async function GET() {
  if (!(await isAdminLogin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  let orders = await readOrders();
  let updated = false;

  orders = orders.map((order) => {
    if (!order.productType) {
      updated = true;
      return {
        ...order,
        productType: detectProductType(order.product || ""),
      };
    }

    return order;
  });

  if (updated) {
    await writeOrders(orders);
  }

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const body = await request.json();

  const productName = body.product || "Premium Everyday Product";
  const productType = body.productType || detectProductType(productName);

  const newOrder: Order = {
    id: "ORD-" + Date.now(),
    productId: body.productId,
    product: productName,
    productType,
    amount: body.amount || "49.99 USDT",
    name: body.name,
    email: body.email,
    address: body.address,
    txid: body.txid,
    screenshot: body.screenshot,
    status: "Pending",
    countedSale: false,
    createdAt: new Date().toLocaleString(),
  };

  const orders = await readOrders();
  orders.unshift(newOrder);
  await writeOrders(orders);

  return NextResponse.json({
    success: true,
    order: newOrder,
  });
}

export async function PATCH(request: Request) {
  if (!(await isAdminLogin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const orders = await readOrders();

  let shouldIncreaseSales = false;
  let productIdToIncrease = "";

  const updatedOrders = orders.map((order) => {
    if (order.id !== body.id) return order;

    const newStatus = body.status || order.status;

    const paidLikeStatus =
      newStatus === "Paid" ||
      newStatus === "Key Sent" ||
      newStatus === "Confirmation ID Sent" ||
      newStatus === "Completed";

    const shouldCountThisSale = paidLikeStatus && !order.countedSale;

    if (shouldCountThisSale) {
      shouldIncreaseSales = true;
      productIdToIncrease = order.productId || "";
    }

    return {
      ...order,
      status: newStatus,
      countedSale: shouldCountThisSale ? true : order.countedSale,

      productType: body.productType ?? order.productType,

      licenseKey: body.licenseKey ?? order.licenseKey,
      activationType: body.activationType ?? order.activationType,
      installationId: body.installationId ?? order.installationId,
      installationImage: body.installationImage ?? order.installationImage,
      confirmationId: body.confirmationId ?? order.confirmationId,

      accountEmail: body.accountEmail ?? order.accountEmail,
      accountPassword: body.accountPassword ?? order.accountPassword,
      loginUrl: body.loginUrl ?? order.loginUrl,

      customerEmail: body.customerEmail ?? order.customerEmail,
      subscriptionAccount:
        body.subscriptionAccount ?? order.subscriptionAccount,
      subscriptionStatus:
        body.subscriptionStatus ?? order.subscriptionStatus,

      deliveryNote: body.deliveryNote ?? order.deliveryNote,
    };
  });

  await writeOrders(updatedOrders);

  if (shouldIncreaseSales && productIdToIncrease) {
    await increaseProductSales(productIdToIncrease);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  if (!(await isAdminLogin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  await writeOrders([]);

  return NextResponse.json({ success: true });
}