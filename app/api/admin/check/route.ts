import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const isLogin = cookieStore.get("admin_login")?.value === "yes";

  return NextResponse.json({ isLogin });
}