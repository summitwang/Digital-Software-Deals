import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { canReadOrder } from '@/lib/orderAccess';

export async function authorizeOrder(req: Request, orderNo: string) {
  const token = req.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) return { status: 401, error: 'Sign in or verify your order email to continue.' } as const;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return { status: 401, error: 'Your session has expired. Please sign in again.' } as const;
  const result = await supabaseAdmin.from('orders').select('order_no,user_id,customer_email').eq('order_no', orderNo).maybeSingle();
  if (result.error) return { status: 503, error: 'Unable to load order. Please try again.' } as const;
  if (!result.data || !canReadOrder(data.user, result.data)) return { status: 404, error: 'Order not found.' } as const;
  return { status: 200, error: null } as const;
}
