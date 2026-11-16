import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userData, error: userError } =
    await supabaseAdmin.auth.getUser(token);

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const userId = userData.user.id;
  // 分开查询，避免将邮箱插入 PostgREST 过滤表达式；游客记录要求邮箱已验证。
  const owned = await supabaseAdmin.from("orders").select("*").eq("user_id", userId);
  const guest = userData.user.email_confirmed_at && userData.user.email
    ? await supabaseAdmin.from("orders").select("*").is("user_id", null).eq("customer_email", userData.user.email)
    : { data: [], error: null };
  if (owned.error || guest.error) return NextResponse.json({ error: "Unable to load orders" }, { status: 503 });
  const orders = [...(owned.data || []), ...(guest.data || [])].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return NextResponse.json({ orders }, { headers: { "Cache-Control": "private, no-store" } });
}
