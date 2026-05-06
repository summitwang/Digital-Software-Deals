import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();

  if (body.password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { image_base64, image_name } = body;

  if (!image_base64 || !image_name) {
    return NextResponse.json({ error: "Missing image" }, { status: 400 });
  }

  try {
    const base64Data = image_base64.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const ext = image_name.split(".").pop() || "png";
    const filePath = `product-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("product-images")
      .upload(filePath, buffer, {
        contentType: "image/*",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      image_url: data.publicUrl,
    });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
