import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header, Footer, Card, Button, AlertBox, LoadingSpinner } from '../components/common';
import { Phone } from 'lucide-react';
import { orderAPI } from '../services/api';

const ORDER_STEPS = ['pending', 'preparing', 'picked_up', 'out_for_delivery', 'delivered'];
const SUPPORT_PHONE = '+919999999999';
const SATNA_CENTER = { lat: 24.5773, lng: 80.8272 };
const SATNA_BBOX = {
  west: 80.32,
  south: 24.22,
  east: 81.2,
  north: 24.95,
};
const SATNA_OSM_EMBED_URL = `https://www.openstreetmap.org/export/embed.html?bbox=${SATNA_BBOX.west}%2C${SATNA_BBOX.south}%2C${SATNA_BBOX.east}%2C${SATNA_BBOX.north}&layer=mapnik&marker=${SATNA_CENTER.lat}%2C${SATNA_CENTER.lng}`;
const SATNA_OSM_FULL_MAP_URL = `https://www.openstreetmap.org/?mlat=${SATNA_CENTER.lat}&mlon=${SATNA_CENTER.lng}#map=11/${SATNA_CENTER.lat}/${SATNA_CENTER.lng}`;

export const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await orderAPI.getOrder(id);
        setOrder(response.data.order);
      } catch (_err) {
        setError('Order not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const currentStepIndex = useMemo(() => {
    const status = order?.status;
    const idx = ORDER_STEPS.indexOf(status);
    return idx >= 0 ? idx : 0;
  }, [order?.status]);

  const trackingMapData = useMemo(() => {
    const customerLat = Number(order?.customer_lat);
    const customerLng = Number(order?.customer_lng);
    const pharmacyLat = Number(order?.pharmacy_lat);
    const pharmacyLng = Number(order?.pharmacy_lng);
    const hasCustomer = Number.isFinite(customerLat) && Number.isFinite(customerLng);
    const hasPharmacy = Number.isFinite(pharmacyLat) && Number.isFinite(pharmacyLng);

    if (hasCustomer && hasPharmacy) {
      const latPadding = 0.03;
      const lngPadding = 0.03;
      const south = Math.min(customerLat, pharmacyLat) - latPadding;
      const north = Math.max(customerLat, pharmacyLat) + latPadding;
      const west = Math.min(customerLng, pharmacyLng) - lngPadding;
      const east = Math.max(customerLng, pharmacyLng) + lngPadding;
      const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${customerLat}%2C${customerLng}`;
      const directionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${pharmacyLat}%2C${pharmacyLng}%3B${customerLat}%2C${customerLng}`;
      return {
        embedUrl,
        primaryLinkUrl: directionsUrl,
        primaryLinkText: 'Open Route Directions',
        subtitle: 'Live area around pharmacy and delivery location',
      };
    }

    return {
      embedUrl: SATNA_OSM_EMBED_URL,
      primaryLinkUrl: SATNA_OSM_FULL_MAP_URL,
      primaryLinkText: 'Open Full Satna Map',
      subtitle: 'Satna district coverage map',
    };
  }, [order]);

  const handleShareTrackingLink = async () => {
    const trackingUrl = `${window.location.origin}/orders/${id}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(trackingUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
        return;
      }
    } catch (_err) {
      // fallback below
    }
    window.prompt('Copy your tracking link:', trackingUrl);
  };

  if (loading) {
    return (
      <>
        <Header userType="customer" />
        <main className="container mx-auto px-4 py-8"><LoadingSpinner /></main>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header userType="customer" />
        <main className="container mx-auto px-4 py-8 max-w-xl">
          <AlertBox type="error">{error || 'No order data available'}</AlertBox>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header userType="customer" />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Order Tracking</h1>
        <p className="text-gray-600 mb-8">
          Order Number: <span className="font-mono font-bold">{order.order_number}</span>
        </p>
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="primary" size="md" className="sm:flex-1" onClick={handleShareTrackingLink}>
              {copied ? 'Tracking Link Copied' : 'Share Tracking Link'}
            </Button>
            <a href={`tel:${SUPPORT_PHONE}`} className="sm:flex-1">
              <Button variant="outline" size="md" className="w-full">
                <Phone className="w-4 h-4 mr-1" />
                Contact Support
              </Button>
            </a>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-2xl font-bold mb-8">Live Tracking</h2>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Delivery Map</h3>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <iframe
                    title="Satna District Delivery Map"
                    src={trackingMapData.embedUrl}
                    className="w-full h-72"
                    loading="lazy"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {trackingMapData.subtitle}. Currently we deliver only in Satna district.
                  {' '}
                  <a
                    href={trackingMapData.primaryLinkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-blue-700 hover:text-blue-800"
                  >
                    {trackingMapData.primaryLinkText}
                  </a>
                </p>
              </div>
              <div className="space-y-6">
                {ORDER_STEPS.map((step, idx) => {
                  const isCurrent = idx === currentStepIndex;
                  const isDone = idx < currentStepIndex;
                  return (
                    <div key={step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          isCurrent ? 'bg-blue-600 animate-pulse' : isDone ? 'bg-green-600' : 'bg-gray-300'
                        }`}>
                          {idx + 1}
                        </div>
                        {idx < ORDER_STEPS.length - 1 && (
                          <div className={`h-12 w-1 ${isDone ? 'bg-green-600' : 'bg-gray-300'}`} />
                        )}
                      </div>
                      <div className="pt-1">
                        <h3 className={`font-semibold ${isCurrent ? 'text-blue-600' : 'text-gray-900'}`}>
                          {step.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase())}
                        </h3>
                        <p className="text-gray-600 text-sm">Status: {order.status}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="mt-6">
              <h3 className="font-bold text-lg mb-4">Order Items</h3>
              <ul className="space-y-2">
                {(order.items || []).map((item) => (
                  <li key={item.medicine_id} className="flex justify-between">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-semibold">Qty: {item.quantity}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div>
            <Card>
              <h3 className="font-bold text-lg mb-6">Order Summary</h3>
              <div className="mb-6 pb-6 border-b">
                <p className="text-gray-600 text-sm font-semibold">FROM</p>
                <p className="font-semibold mt-1">{order.pharmacy_name || 'Pharmacy'}</p>
              </div>
              <div className="mb-6 pb-6 border-b">
                <p className="text-gray-600 text-sm font-semibold">TOTAL</p>
                <p className="font-bold text-2xl text-blue-600 mt-1">Rs {order.total_amount}</p>
              </div>
              <AlertBox type="success">
                Order status: {order.status}
              </AlertBox>

              <div className="mt-6 space-y-2">
                <Button variant="outline" size="md" className="w-full" onClick={handleShareTrackingLink}>
                  {copied ? 'Tracking Link Copied' : 'Share Tracking Link'}
                </Button>
                <a href={`tel:${SUPPORT_PHONE}`}>
                  <Button variant="outline" size="md" className="w-full">
                    <Phone className="w-4 h-4 mr-1" />
                    Contact Support
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
