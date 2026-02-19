import React, { useEffect, useState } from 'react';
import { Header, Footer, Card, Button, AlertBox, LoadingSpinner } from '../components/common';
import { PackagePlus, Receipt, IndianRupee, ShoppingBag, Clock3, ShieldCheck } from 'lucide-react';
import { adminAPI } from '../services/api';

const initialForm = {
  name: '',
  strength: '',
  unit: 'strip',
  category: 'Everyday',
  price: '',
  mrp: '',
  offer_text: '',
  stock_qty: 20,
};

export const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminProfile, setAdminProfile] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState('');

  const loadDashboard = async (profile) => {
    if (!profile?.medical_name) {
      setError('Admin profile missing medical name. Please login again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getStoreDashboard({
        medical_name: profile.medical_name,
        location: profile.address || 'Unknown',
      });
      setDashboard(response.data);
    } catch (_err) {
      setError('Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('adminProfile');
      if (!raw) {
        setError('Admin profile not found. Please login as admin.');
        setLoading(false);
        return;
      }
      const parsed = JSON.parse(raw);
      setAdminProfile(parsed);
      loadDashboard(parsed);
    } catch (_err) {
      setError('Invalid admin profile data. Please login again.');
      setLoading(false);
    }
  }, []);

  const onFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setFormMessage('');
    setFormError('');

    if (!adminProfile?.medical_name) {
      setFormError('Admin profile is missing. Please login again.');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Medicine name is required.');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setFormError('Valid price is required.');
      return;
    }

    setFormLoading(true);
    try {
      await adminAPI.addMedicine({
        medical_name: adminProfile.medical_name,
        location: adminProfile.address || 'Unknown',
        name: formData.name.trim(),
        strength: formData.strength.trim(),
        unit: formData.unit,
        category: formData.category,
        price: Number(formData.price),
        mrp: formData.mrp === '' ? null : Number(formData.mrp),
        offer_text: formData.offer_text.trim(),
        stock_qty: Number(formData.stock_qty || 0),
      });
      setFormMessage('Medicine added successfully.');
      setFormData(initialForm);
      await loadDashboard(adminProfile);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to add medicine.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <Header userType="admin" userName={adminProfile?.user_name || 'Admin'} />
      <main className="market-shell py-6">
        <section className="surface-card p-6 mb-6 bg-gradient-to-r from-[#134e4a] to-[#115e59] text-white border-0">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">Store Command Center</p>
          <h1 className="text-3xl font-black mt-2">Admin Dashboard</h1>
          <p className="text-emerald-50 mt-2">Track your store sales, incoming orders, and inventory updates.</p>
        </section>

        {adminProfile && (
          <section className="surface-card p-5 mb-6">
            <h2 className="text-lg font-black mb-3">Admin Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <p><span className="font-semibold">User Name:</span> {adminProfile.user_name || 'Admin'}</p>
              <p><span className="font-semibold">Medical Name:</span> {adminProfile.medical_name}</p>
              <p><span className="font-semibold">License No.:</span> {adminProfile.license_no}</p>
              <p><span className="font-semibold">Address:</span> {adminProfile.address}</p>
            </div>
          </section>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <AlertBox type="error">{error}</AlertBox>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
              {[
                { icon: Clock3, label: "Today's Orders", value: dashboard.todays_orders, iconWrap: 'bg-blue-100 text-blue-700' },
                { icon: Receipt, label: 'Total Orders', value: dashboard.total_orders, iconWrap: 'bg-violet-100 text-violet-700' },
                { icon: IndianRupee, label: "Today's Sales", value: `Rs ${dashboard.sales_today}`, iconWrap: 'bg-emerald-100 text-emerald-700' },
                { icon: ShoppingBag, label: 'Total Sales', value: `Rs ${dashboard.total_sales}`, iconWrap: 'bg-amber-100 text-amber-700' },
                { icon: ShieldCheck, label: 'Listed Medicines', value: dashboard.medicines_count, iconWrap: 'bg-cyan-100 text-cyan-700' },
              ].map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <Card key={kpi.label}>
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${kpi.iconWrap}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">{kpi.label}</p>
                        <p className="text-xl font-black text-slate-900">{kpi.value}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Card className="xl:col-span-2">
                <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                  <PackagePlus className="w-5 h-5 text-emerald-700" />
                  Add New Medicine
                </h2>

                {formError && <div className="mb-3"><AlertBox type="error">{formError}</AlertBox></div>}
                {formMessage && <div className="mb-3"><AlertBox type="success">{formMessage}</AlertBox></div>}

                <form onSubmit={handleAddMedicine}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Medicine Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => onFormChange('name', e.target.value)}
                        placeholder="e.g. Paracetamol"
                        className="mt-1 w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Strength</label>
                      <input
                        type="text"
                        value={formData.strength}
                        onChange={(e) => onFormChange('strength', e.target.value)}
                        placeholder="e.g. 500mg"
                        className="mt-1 w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Unit</label>
                      <select
                        value={formData.unit}
                        onChange={(e) => onFormChange('unit', e.target.value)}
                        className="mt-1 w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="strip">Strip</option>
                        <option value="bottle">Bottle</option>
                        <option value="pack">Pack</option>
                        <option value="unit">Unit</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => onFormChange('category', e.target.value)}
                        className="mt-1 w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Everyday">Everyday</option>
                        <option value="Vitamins">Vitamins</option>
                        <option value="First Aid">First Aid</option>
                        <option value="Personal Care">Personal Care</option>
                        <option value="Baby Care">Baby Care</option>
                        <option value="Women Health">Women Health</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Price (Rs)</label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => onFormChange('price', e.target.value)}
                        placeholder="e.g. 120"
                        className="mt-1 w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">MRP (Optional)</label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={formData.mrp}
                        onChange={(e) => onFormChange('mrp', e.target.value)}
                        placeholder="auto from price if empty"
                        className="mt-1 w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Offer Text</label>
                      <input
                        type="text"
                        value={formData.offer_text}
                        onChange={(e) => onFormChange('offer_text', e.target.value)}
                        placeholder="e.g. 15% OFF"
                        className="mt-1 w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Stock Qty</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stock_qty}
                        onChange={(e) => onFormChange('stock_qty', e.target.value)}
                        className="mt-1 w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="primary" size="md" className="mt-5" disabled={formLoading}>
                    {formLoading ? 'Adding...' : 'Add Medicine'}
                  </Button>
                </form>
              </Card>

              <Card>
                <h3 className="text-lg font-black mb-4">Recently Added Medicines</h3>
                {dashboard.recent_medicines?.length ? (
                  <ul className="space-y-3">
                    {dashboard.recent_medicines.map((med) => (
                      <li key={med.id} className="border border-slate-200 rounded-lg p-3">
                        <p className="font-bold text-slate-900">{med.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{med.strength || 'General'} • {med.unit}</p>
                        <p className="text-sm mt-1">
                          <span className="font-semibold text-slate-800">Rs {med.price}</span>
                          <span className="text-slate-500 ml-2">{med.offer_text}</span>
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No medicines listed yet.</p>
                )}
              </Card>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
};
