const CART_KEY = 'medihub_cart_v1';

const readCart = () => {
  try {
    const value = localStorage.getItem(CART_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_err) {
    return [];
  }
};

const writeCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart-updated'));
};

export const getCartItems = () => readCart();

export const getCartCount = () =>
  readCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);

export const setCartItems = (items) => {
  writeCart(Array.isArray(items) ? items : []);
};

export const clearCart = () => writeCart([]);

export const addToCart = (medicine) => {
  if (!medicine || !medicine.id) {
    return { ok: false, message: 'Invalid medicine selected.' };
  }

  if (medicine.available === false || Number(medicine.stock_qty || 0) <= 0) {
    return { ok: false, message: 'This medicine is currently out of stock.' };
  }

  const pharmacyId = medicine.pharmacy_id ?? medicine.pharmacyId ?? null;
  if (!pharmacyId) {
    return { ok: false, message: 'Pharmacy information missing for this medicine.' };
  }

  const items = readCart();
  const item = {
    id: medicine.id,
    name: medicine.name,
    strength: medicine.strength,
    unit: medicine.unit,
    price: Number(medicine.price || 0),
    pharmacy_id: pharmacyId,
    pharmacy_name: medicine.pharmacy_name || 'Nearby Pharmacy',
    quantity: 1,
    available: medicine.available,
    stock_qty: medicine.stock_qty,
  };

  if (items.length > 0 && items[0].pharmacy_id !== item.pharmacy_id) {
    // Auto-switch cart to new pharmacy for smoother UX.
    writeCart([item]);
    return { ok: true, message: 'Cart switched to selected pharmacy.' };
  }

  const index = items.findIndex((x) => x.id === item.id);
  if (index >= 0) {
    items[index].quantity += 1;
  } else {
    items.push(item);
  }
  writeCart(items);
  return { ok: true };
};
