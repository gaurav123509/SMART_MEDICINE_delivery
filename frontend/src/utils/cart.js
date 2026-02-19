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
  const items = readCart();
  const item = {
    id: medicine.id,
    name: medicine.name,
    strength: medicine.strength,
    unit: medicine.unit,
    price: Number(medicine.price || 0),
    pharmacy_id: medicine.pharmacy_id,
    pharmacy_name: medicine.pharmacy_name || 'Nearby Pharmacy',
    quantity: 1,
  };

  if (items.length > 0 && items[0].pharmacy_id !== item.pharmacy_id) {
    return {
      ok: false,
      message: 'You can add medicines from one pharmacy at a time. Clear cart to switch pharmacy.',
    };
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
