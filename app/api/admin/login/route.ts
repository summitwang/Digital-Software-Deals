import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  if (body.password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { success: false, message: "Wrong password" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set("admin_login", "yes", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}