export const getQuantityDiscountPercent = (quantity) => {
  const q = Number(quantity || 0);
  if (q >= 10) return 15;
  if (q >= 5) return 10;
  if (q >= 3) return 5;
  return 0;
};

export const getDiscountedUnitPrice = (basePrice, quantity) => {
  const price = Number(basePrice || 0);
  const discountPercent = getQuantityDiscountPercent(quantity);
  const discountedUnitPrice = price * (1 - discountPercent / 100);
  return Number(discountedUnitPrice.toFixed(2));
};

export const getLineTotal = (basePrice, quantity) =>
  Number((getDiscountedUnitPrice(basePrice, quantity) * Number(quantity || 0)).toFixed(2));

export const getLineDiscountAmount = (basePrice, quantity) => {
  const baseTotal = Number(basePrice || 0) * Number(quantity || 0);
  const discountedTotal = getLineTotal(basePrice, quantity);
  return Number((baseTotal - discountedTotal).toFixed(2));
};
