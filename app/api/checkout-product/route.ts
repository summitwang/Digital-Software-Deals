import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { moneyToCents } from '@/lib/checkoutPricing';

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const id = params.get('productId');
  const title = params.get('product');
  if ((!id && !title) || (id && id.length > 128) || (title && title.length > 500)) return NextResponse.json({error:'Please select a product.'},{status:400});
  // 老分享链接只允许唯一标题匹配，页面拿到 ID 后所有写入都使用 ID。
  let query = supabaseAdmin.from('products').select('id,title,price,promo_price,stock,product_type').eq('is_active',true);
  query = id ? query.eq('id',id) : query.eq('title',title!);
  const {data,error} = await query.maybeSingle();
  if (error || !data) return NextResponse.json({error:'Product unavailable. Please select it again from the catalog.'},{status:404});
  try {
    const price = moneyToCents(data.promo_price || data.price) / 100;
    return NextResponse.json({product:{id:String(data.id),title:data.title,price,stock:Math.max(0,Math.min(1000,Number(data.stock)||0)),product_type:data.product_type}}, {headers:{'Cache-Control':'no-store'}});
  } catch { return NextResponse.json({error:'Product price is unavailable.'},{status:409}); }
}
