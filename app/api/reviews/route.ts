import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";

export const runtime = "nodejs";

type Review = {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  createdAt: string;
};

const filePath = path.join(process.cwd(), "data", "reviews.json");

async function isAdminLogin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_login")?.value === "yes";
}

async function readReviews(): Promise<Review[]> {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeReviews(reviews: Review[]) {
  await fs.writeFile(filePath, JSON.stringify(reviews, null, 2));
}

export async function GET() {
  const reviews = await readReviews();
  return NextResponse.json(reviews);
}

export async function POST(request: Request) {
  if (!(await isAdminLogin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const reviews = await readReviews();

  const newReview: Review = {
    id: "REV-" + Date.now(),
    productId: body.productId,
    name: body.name || "Customer",
    rating: Number(body.rating || 5),
    comment: body.comment || "",
    mediaUrl: body.mediaUrl || "",
    mediaType: body.mediaType || "",
    createdAt: new Date().toLocaleString(),
  };

  reviews.unshift(newReview);
  await writeReviews(reviews);

  return NextResponse.json({ success: true, review: newReview });
}

export async function DELETE(request: Request) {
  if (!(await isAdminLogin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const reviews = await readReviews();

  const updatedReviews = reviews.filter((review) => review.id !== body.id);

  await writeReviews(updatedReviews);

  return NextResponse.json({ success: true });
}