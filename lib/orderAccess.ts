type Buyer = { id: string; email?: string; email_confirmed_at?: string | null };
type Ownership = { user_id?: string | null; customer_email?: string | null };

// 已绑定订单仅认用户 ID；游客订单仅允许已验证的同邮箱用户领取。
export function canReadOrder(user: Buyer, order: Ownership): boolean {
  if (order.user_id) return order.user_id === user.id;
  return Boolean(user.email_confirmed_at && user.email && order.customer_email &&
    user.email.toLowerCase() === order.customer_email.toLowerCase());
}
