import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Header, Footer, Button, Card, AlertBox } from '../components/common';
import { orderAPI, pharmacyAPI } from '../services/api';
import { clearCart, getCartItems } from '../utils/cart';
import { getLineDiscountAmount, getLineTotal } from '../utils/pricing';

const DISTANCE_SURCHARGE_THRESHOLD_KM = 2.5;
const DISTANCE_SURCHARGE_AMOUNT = 30;

const calculateDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState('address');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sharingLocation, setSharingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [customerLocation, setCustomerLocation] = useState(null);
  const [pharmacyCoords, setPharmacyCoords] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [distanceSurcharge, setDistanceSurcharge] = useState(0);
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    paymentMethod: 'cod',
  });

  const deliveryType = location.state?.deliveryType || 'standard';
  const cartItems = useMemo(() => getCartItems(), []);
  const primaryPharmacyId = cartItems[0]?.pharmacy_id;
  const subtotal = cartItems.reduce((sum, item) => sum + getLineTotal(item.price, item.quantity), 0);
  const quantityDiscount = cartItems.reduce((sum, item) => sum + getLineDiscountAmount(item.price, item.quantity), 0);
  const deliveryCharge = deliveryType === 'express' ? 30 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryCharge + tax + distanceSurcharge;
  const isSatnaAddress = (address) => address.toLowerCase().includes('satna');

  useEffect(() => {
    if (!primaryPharmacyId) {
      return;
    }
    let isMounted = true;
    const fetchPharmacyCoords = async () => {
      try {
        const response = await pharmacyAPI.getPharmacy(primaryPharmacyId);
        const pharmacy = response?.data?.pharmacy;
        if (!isMounted || !pharmacy) {
          return;
        }
        setPharmacyCoords({
          lat: Number(pharmacy.lat),
          lng: Number(pharmacy.lng),
        });
      } catch (_err) {
        if (isMounted) {
          setPharmacyCoords(null);
        }
      }
    };
    fetchPharmacyCoords();
    return () => {
      isMounted = false;
    };
  }, [primaryPharmacyId]);

  useEffect(() => {
    if (!customerLocation || !pharmacyCoords) {
      setDistanceKm(null);
      setDistanceSurcharge(0);
      return;
    }
    const nextDistance = calculateDistanceKm(
      customerLocation.lat,
      customerLocation.lng,
      pharmacyCoords.lat,
      pharmacyCoords.lng
    );
    setDistanceKm(nextDistance);
    setDistanceSurcharge(nextDistance > DISTANCE_SURCHARGE_THRESHOLD_KM ? DISTANCE_SURCHARGE_AMOUNT : 0);
  }, [customerLocation, pharmacyCoords]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported on your device/browser.');
      return;
    }

    setError('');
    setSharingLocation(true);
    setLocationStatus('Fetching live location...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCustomerLocation({
          lat: Number(coords.latitude),
          lng: Number(coords.longitude),
        });
        setLocationStatus('Location shared successfully.');
        setSharingLocation(false);
      },
      () => {
        setLocationStatus('Location share failed. Please allow location permission.');
        setSharingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validateAddress = () => {
    const normalizedAddress = formData.address.trim();
    if (!normalizedAddress) return 'Address is required';
    if (!isSatnaAddress(normalizedAddress)) return 'Currently delivery is available only in Satna district.';
    if (!/^\d{10}$/.test(formData.phone)) return 'Enter valid 10 digit phone';
    return '';
  };

  const handleContinueToPayment = () => {
    const validationError = validateAddress();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setStep('payment');
  };

  const handleCreateOrder = async () => {
    const validationError = validateAddress();
    if (validationError) {
      setError(validationError);
      setStep('address');
      return;
    }
    if (!cartItems.length) {
      setError('Cart is empty. Add medicines before checkout.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        user_id: 1,
        pharmacy_id: cartItems[0].pharmacy_id,
        is_express: deliveryType === 'express',
        delivery_address: formData.address.trim(),
        customer_phone: formData.phone.trim(),
        customer_lat: customerLocation?.lat ?? null,
        customer_lng: customerLocation?.lng ?? null,
        items: cartItems.map((item) => ({
          medicine_id: item.id,
          quantity: item.quantity,
        })),
      };
      const response = await orderAPI.create(payload);
      const orderId = response.data?.order?.id;
      if (!orderId) {
        throw new Error('Order created but id missing');
      }
      clearCart();
      navigate(`/orders/${orderId}`);
    } catch (err) {
      console.error('Order creation failed', err);
      setError(err?.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems.length) {
    return (
      <>
        <Header userType="customer" />
        <main className="container mx-auto px-4 py-12 max-w-xl">
          <AlertBox type="warning">
            Cart is empty. <Link to="/search" className="font-bold">Search medicines</Link> and add items first.
          </AlertBox>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header userType="customer" />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          {error && <AlertBox type="error">{error}</AlertBox>}

          <div className="flex gap-4 mb-8 mt-4">
            {['address', 'payment', 'confirm'].map((s, idx) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition ${
                  ['address', 'payment', 'confirm'].indexOf(step) >= idx ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {step === 'address' && (
            <Card>
              <h2 className="text-2xl font-bold mb-6">Delivery Address</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block font-semibold mb-2">Full Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter your complete address..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Delivery service is currently active only in Satna district.
                  </p>
                </div>
                <div>
                  <label className="block font-semibold mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9999999999"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="rounded-lg border p-3 bg-slate-50">
                  <p className="font-semibold text-sm mb-2">Share Current Location (Optional)</p>
                  <Button type="button" variant="outline" size="sm" onClick={handleShareLocation} disabled={sharingLocation}>
                    {sharingLocation ? 'Fetching location...' : 'Share My Location'}
                  </Button>
                  {locationStatus && <p className="text-xs text-gray-600 mt-2">{locationStatus}</p>}
                  {customerLocation && (
                    <p className="text-xs text-emerald-700 mt-1">
                      Location: {customerLocation.lat.toFixed(5)}, {customerLocation.lng.toFixed(5)}
                    </p>
                  )}
                  {distanceKm !== null && (
                    <p className="text-xs text-gray-700 mt-1">
                      Distance from medical: {distanceKm} km
                      {distanceSurcharge > 0
                        ? ` (More than ${DISTANCE_SURCHARGE_THRESHOLD_KM} km, Rs ${DISTANCE_SURCHARGE_AMOUNT} extra)`
                        : ' (No extra distance charge)'}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="primary" size="lg" className="w-full" onClick={handleContinueToPayment}>
                Continue to Payment
              </Button>
            </Card>
          )}

          {step === 'payment' && (
            <Card>
              <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
              <div className="space-y-3 mb-6">
                {[
                  { value: 'cod', label: 'Cash on Delivery' },
                  { value: 'upi', label: 'UPI (Google Pay, PhonePe)' },
                  { value: 'card', label: 'Credit/Debit Card' },
                ].map((method) => (
                  <label key={method.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50">
                    <input type="radio" name="paymentMethod" value={method.value} checked={formData.paymentMethod === method.value} onChange={handleInputChange} />
                    <span className="font-semibold">{method.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep('address')}>Back</Button>
                <Button variant="primary" size="lg" className="flex-1" onClick={() => setStep('confirm')}>Review Order</Button>
              </div>
            </Card>
          )}

          {step === 'confirm' && (
            <Card>
              <h2 className="text-2xl font-bold mb-6">Review Order</h2>
              <div className="space-y-4">
                <div className="flex justify-between pb-4 border-b">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-semibold">{cartItems.length}</span>
                </div>
                <div className="flex justify-between pb-4 border-b">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-semibold capitalize">{formData.paymentMethod}</span>
                </div>
                <div className="flex justify-between pb-4 border-b">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="font-semibold capitalize">{deliveryType}</span>
                </div>
                {distanceKm !== null && (
                  <div className="flex justify-between pb-4 border-b">
                    <span className="text-gray-600">Distance from Medical:</span>
                    <span className="font-semibold">{distanceKm} km</span>
                  </div>
                )}
                <div className="flex justify-between pb-4 border-b">
                  <span className="text-gray-600">Distance Charge ({'>'}{DISTANCE_SURCHARGE_THRESHOLD_KM} km):</span>
                  <span className="font-semibold">Rs {distanceSurcharge}</span>
                </div>
                {quantityDiscount > 0 && (
                  <div className="flex justify-between pb-4 border-b">
                    <span className="text-gray-600">Quantity Discount:</span>
                    <span className="font-semibold text-emerald-700">- Rs {quantityDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">Rs {total}</span>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep('payment')}>Back</Button>
                <Button variant="primary" size="lg" className="flex-1" disabled={loading} onClick={handleCreateOrder}>
                  {loading ? 'Placing...' : 'Place Order'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};
