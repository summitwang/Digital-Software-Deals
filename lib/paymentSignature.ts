import { createHmac, timingSafeEqual } from 'node:crypto';
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, item]) => [key, canonical(item)]));
}
// 未配置密钥时拒绝处理，不能绕过签名进入库存和订单写入。
export function verifyPaymentSignature(raw: string, signature: string | null, secret: string | undefined): boolean {
  if (!secret || !signature || !/^[a-f0-9]{128}$/i.test(signature)) return false;
  try {
    const expected = createHmac('sha512', secret).update(JSON.stringify(canonical(JSON.parse(raw)))).digest();
    return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
  } catch { return false; }
}
