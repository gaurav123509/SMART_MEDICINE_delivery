import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header, Footer, Button, AlertBox, LoadingSpinner, Card, MedicineImage } from '../components/common';
import { medicineAPI } from '../services/api';
import { addToCart } from '../utils/cart';

export const MedicineDetailsPage = () => {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMedicine = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await medicineAPI.getMedicine(id);
        setMedicine(response?.data?.medicine || null);
      } catch (_err) {
        setError('Medicine details load nahi ho paaye.');
      } finally {
        setLoading(false);
      }
    };
    fetchMedicine();
  }, [id]);

  const handleAddToCart = () => {
    if (!medicine) return;
    const result = addToCart(medicine);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage(result.message || `${medicine.name} added to cart`);
  };

  if (loading) {
    return (
      <>
        <Header userType="customer" />
        <main className="market-shell py-10">
          <LoadingSpinner />
        </main>
        <Footer />
      </>
    );
  }

  if (error || !medicine) {
    return (
      <>
        <Header userType="customer" />
        <main className="market-shell py-8">
          <AlertBox type="error">{error || 'Medicine not found'}</AlertBox>
          <Link to="/search" className="inline-block mt-4 text-sm font-bold text-cyan-700 hover:text-cyan-800">
            Back to search
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const price = Number(medicine.price || 0);
  const mrp = Number(medicine.mrp || Math.round(price * 1.2));

  return (
    <>
      <Header userType="customer" userName={localStorage.getItem('userName') || 'Customer'} />
      <main className="market-shell py-6">
        {message && <div className="mb-4"><AlertBox type="info">{message}</AlertBox></div>}

        <div className="mb-4">
          <Link to="/search" className="text-sm font-bold text-cyan-700 hover:text-cyan-800">← Back to Search</Link>
        </div>

        <Card className="border-cyan-100">
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
            <div className="rounded-2xl bg-gradient-to-br from-cyan-50 to-slate-100 overflow-hidden h-[320px] border border-cyan-100">
              <MedicineImage
                medicine={medicine}
                alt={medicine.name}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500 font-bold">{medicine.category || 'General'}</p>
              <h1 className="text-3xl font-black text-slate-900 mt-2 brand-heading">{medicine.name}</h1>
              <p className="text-sm text-slate-600 mt-2">
                {medicine.strength || 'General'} • {medicine.unit || 'unit'}
              </p>
              {medicine.use_for && (
                <p className="text-sm text-slate-700 mt-3"><span className="font-bold">Use:</span> {medicine.use_for}</p>
              )}

              <div className="mt-5 flex items-end gap-3">
                <p className="text-3xl font-black text-slate-900">Rs {price.toFixed(2)}</p>
                <p className="text-base text-slate-400 line-through">Rs {mrp.toFixed(2)}</p>
                {Number(medicine.offer_percent || 0) > 0 && (
                  <p className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-1">{medicine.offer_percent}% OFF</p>
                )}
              </div>

              <p className="text-sm text-slate-600 mt-3">Sold by: {medicine.pharmacy_name || 'Nearby Pharmacy'}</p>
              <p className="text-sm mt-1 font-semibold text-emerald-700">
                {medicine.available ? `In stock (${medicine.stock_qty})` : 'Out of stock'}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="rounded-full"
                  onClick={handleAddToCart}
                  disabled={!medicine.available}
                >
                  Add to Cart
                </Button>
                <Link to="/cart">
                  <Button size="lg" variant="outline" className="rounded-full">Go to Cart</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </>
  );
};
