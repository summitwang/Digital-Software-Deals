type CatalogPrice = { price: unknown; promo_price?: unknown; stock: unknown };

// 所有金额先转换为整数分；禁止空值、布尔值或超出两位小数的金额。
export function moneyToCents(value: unknown): number {
  if (typeof value !== "number" && typeof value !== "string") throw new Error("Invalid price.");
  const text = String(value);
  if (!/^\d+(\.\d{1,2})?$/.test(text)) throw new Error("Invalid price.");
  const [whole, fraction = ""] = text.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents <= 0) throw new Error("Invalid price.");
  return cents;
}

export function checkoutQuantity(value: unknown): number {
  const quantity = value === undefined ? 1 : value;
  if (typeof quantity !== "number" || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 1000) {
    throw new Error("Quantity must be a whole number between 1 and 1000.");
  }
  return quantity;
}

export function checkoutTotal(product: CatalogPrice, quantity: number, submittedAmount: unknown): number {
  checkoutQuantity(quantity);
  const stock = Number(product.stock);
  if (!Number.isSafeInteger(stock) || stock < quantity) throw new Error("Not enough stock available.");
  // 兼容现有商品：空促销价或零表示未设置促销，其他非法值直接拒绝。
  const promo = product.promo_price;
  const price = promo === null || promo === undefined || promo === "" || promo === 0 || promo === "0" || promo === "0.00"
    ? product.price : promo;
  const total = moneyToCents(price) * quantity;
  if (!Number.isSafeInteger(total)) throw new Error("Invalid order total.");
  // 旧结账页面仍提交展示金额；不一致时要求刷新，避免按另一价格静默下单。
  if (moneyToCents(submittedAmount) !== total) throw new Error("Price changed. Please reopen the product page and check out again.");
  return total / 100;
}
