import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer, Button, Card } from '../components/common';
import { Trash2, Plus, Minus, ShieldCheck, Clock3, Zap, Truck } from 'lucide-react';
import { getCartItems, setCartItems } from '../utils/cart';
import { getDiscountedUnitPrice, getLineDiscountAmount, getLineTotal, getQuantityDiscountPercent } from '../utils/pricing';

export const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartState] = useState([]);
  const [deliveryType, setDeliveryType] = useState('standard');

  useEffect(() => {
    setCartState(getCartItems());
  }, []);

  const syncCart = (items) => {
    setCartState(items);
    setCartItems(items);
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    const next = cartItems.map((item) => (item.id === id ? { ...item, quantity } : item));
    syncCart(next);
  };

  const removeItem = (id) => {
    const next = cartItems.filter((item) => item.id !== id);
    syncCart(next);
  };

  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + getLineTotal(item.price, item.quantity), 0), [cartItems]);
  const quantityDiscount = useMemo(
    () => cartItems.reduce((sum, item) => sum + getLineDiscountAmount(item.price, item.quantity), 0),
    [cartItems]
  );
  const itemCount = useMemo(() => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0), [cartItems]);
  const deliveryCharge = deliveryType === 'express' ? 30 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryCharge + tax;
  const etaLabel = deliveryType === 'express' ? '15-20 min' : '30-45 min';

  const pharmacyName = cartItems[0]?.pharmacy_name;

  return (
    <>
      <Header userType="customer" />
      <main className="market-shell py-8 md:py-10">
        <div className="mb-6 md:mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">Checkout Flow</p>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-1">Your Cart</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Secure Checkout
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5">
              <Truck className="w-4 h-4 text-sky-600" />
              Fast Local Delivery
            </span>
            {pharmacyName && (
              <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5">
                Fulfilled by <span className="font-bold text-slate-800">{pharmacyName}</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cartItems.length > 0 ? (
              <>
                <Card className="mb-4 p-4 md:p-5 bg-gradient-to-r from-[#f8fbff] to-white border-sky-100">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-600">Cart summary</p>
                      <p className="text-xl font-extrabold text-slate-900">{itemCount} items ready to order</p>
                    </div>
                    {quantityDiscount > 0 && (
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 text-sm font-bold">
                        <Zap className="w-4 h-4" />
                        You saved Rs {quantityDiscount}
                      </div>
                    )}
                  </div>
                </Card>

                {cartItems.map((item) => (
                  <Card key={item.id} className="mb-4 p-4 md:p-5">
                    <div className="flex flex-col md:flex-row gap-4 md:items-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={item.image_url || '/medicine-placeholder.svg'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = '/medicine-placeholder.svg';
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-slate-900 truncate">{item.name}</h3>
                        <p className="text-slate-500 text-sm mt-0.5">{item.strength || 'General'} • {item.unit || 'unit'}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-bold text-sky-700">Rs {getDiscountedUnitPrice(item.price, item.quantity)} / unit</span>
                          {getQuantityDiscountPercent(item.quantity) > 0 && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-1">
                              {getQuantityDiscountPercent(item.quantity)}% quantity discount
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 w-fit">
                        <Button variant="secondary" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2.5">
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="min-w-8 text-center font-bold text-slate-800">{item.quantity}</span>
                        <Button variant="secondary" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2.5">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="md:min-w-32 text-left md:text-right">
                        <p className="font-extrabold text-lg text-slate-900">Rs {getLineTotal(item.price, item.quantity)}</p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="mt-1 inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 text-sm font-semibold"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            ) : (
              <Card className="p-6 md:p-8 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
                  <Truck className="w-7 h-7 text-slate-500" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">Your cart is empty</h2>
                <p className="text-slate-600 mt-2">Add medicines to continue with checkout.</p>
                <Button variant="primary" size="md" className="mt-5" onClick={() => navigate('/search')}>
                  Search Medicines
                </Button>
              </Card>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <Card className="p-5 md:p-6">
                  <h2 className="font-extrabold text-2xl mb-5">Order Summary</h2>

                  <div className="mb-6 pb-6 border-b border-slate-200">
                    <h3 className="font-bold mb-3">Delivery Type</h3>
                    <div className="space-y-2.5">
                      <label className={`block rounded-lg border p-3 cursor-pointer transition ${deliveryType === 'standard' ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                        <input type="radio" name="delivery" value="standard" checked={deliveryType === 'standard'} onChange={(e) => setDeliveryType(e.target.value)} className="sr-only" />
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Clock3 className="w-4 h-4 text-slate-600 mt-0.5" />
                            <div>
                              <p className="font-semibold text-slate-900">Standard</p>
                              <p className="text-xs text-slate-600">30-45 min</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-emerald-700">Free</span>
                        </div>
                      </label>

                      <label className={`block rounded-lg border p-3 cursor-pointer transition ${deliveryType === 'express' ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                        <input type="radio" name="delivery" value="express" checked={deliveryType === 'express'} onChange={(e) => setDeliveryType(e.target.value)} className="sr-only" />
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500 mt-0.5" />
                            <div>
                              <p className="font-semibold text-slate-900">Express</p>
                              <p className="text-xs text-slate-600">15-20 min</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-slate-900">Rs 30</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-6 pb-6 border-b border-slate-200 text-sm">
                    <div className="flex justify-between"><span className="text-slate-600">Items ({itemCount})</span><span className="font-semibold">Rs {subtotal}</span></div>
                    {quantityDiscount > 0 && (
                      <div className="flex justify-between"><span className="text-slate-600">Quantity Discount</span><span className="font-semibold text-emerald-700">- Rs {quantityDiscount}</span></div>
                    )}
                    <div className="flex justify-between"><span className="text-slate-600">Delivery</span><span className="font-semibold">{deliveryCharge === 0 ? 'Free' : `Rs ${deliveryCharge}`}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Tax (5%)</span><span className="font-semibold">Rs {tax}</span></div>
                  </div>

                  <div className="flex justify-between mb-6 text-xl font-extrabold">
                    <span>Total</span>
                    <span className="text-sky-700">Rs {total}</span>
                  </div>

                  <div className="mb-4 rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700 flex items-center gap-2">
                    <Clock3 className="w-4 h-4 text-slate-500" />
                    Estimated arrival: <span className="font-bold text-slate-900">{etaLabel}</span>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/checkout', { state: { deliveryType } })}
                  >
                    Proceed to Checkout
                  </Button>

                  <p className="mt-3 text-xs text-slate-500 text-center">
                    By continuing, you agree to safe medicine handling and verified delivery.
                  </p>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};
