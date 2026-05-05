import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";

export const runtime = "nodejs";

type ProductType = "license_key" | "office365_account" | "subscription";

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

const filePath = path.join(process.cwd(), "data", "products.json");

async function isAdminLogin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_login")?.value === "yes";
}

async function readProducts(): Promise<Product[]> {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeProducts(products: Product[]) {
  await fs.writeFile(filePath, JSON.stringify(products, null, 2));
}

export async function GET() {
  const products = await readProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  if (!(await isAdminLogin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const products = await readProducts();

  const newProduct: Product = {
    id: "PROD-" + Date.now(),
    title: body.title,
    price: body.price,
    productType: body.productType,
    image: body.image || "",
    description: body.description || "",
    sales: Number(body.sales || 0),
    createdAt: new Date().toLocaleString(),
  };

  products.unshift(newProduct);
  await writeProducts(products);

  return NextResponse.json({ success: true, product: newProduct });
}

export async function PATCH(request: Request) {
  if (!(await isAdminLogin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const products = await readProducts();

  const updatedProducts = products.map((product) => {
    if (product.id !== body.id) return product;

    return {
      ...product,
      title: body.title ?? product.title,
      price: body.price ?? product.price,
      productType: body.productType ?? product.productType,
      image: body.image ?? product.image,
      description: body.description ?? product.description,
      sales: body.sales !== undefined ? Number(body.sales) : product.sales,
    };
  });

  await writeProducts(updatedProducts);

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  if (!(await isAdminLogin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const products = await readProducts();

  const updatedProducts = products.filter((product) => product.id !== body.id);

  await writeProducts(updatedProducts);

  return NextResponse.json({ success: true });
}