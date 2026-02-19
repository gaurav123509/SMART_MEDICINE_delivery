import React, { useEffect, useState } from 'react';
import { Header, Footer, Card, Button, AlertBox, LoadingSpinner } from '../components/common';
import { TrendingUp, Store, Zap, DollarSign, Timer, ShieldCheck, ClipboardList } from 'lucide-react';
import { sellerAPI } from '../services/api';

export const SellerDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await sellerAPI.getDashboard();
        setDashboard(response.data);
      } catch (_err) {
        setError('Failed to load seller dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <>
      <Header userType="seller" userName="Seller" />
      <main className="market-shell py-6">
        <section className="surface-card p-6 mb-6 bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white border-0">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Seller Control Center</p>
          <h1 className="text-3xl font-black mt-2">Seller Dashboard</h1>
          <p className="text-slate-300 mt-2">Monitor orders, revenue, and inventory performance in one place.</p>
        </section>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <AlertBox type="error">{error}</AlertBox>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {[
                { icon: Zap, label: 'New Orders', value: dashboard.new_orders, iconWrap: 'bg-sky-100 text-sky-700' },
                { icon: DollarSign, label: "Today's Earnings", value: `Rs ${dashboard.earnings_today}`, iconWrap: 'bg-emerald-100 text-emerald-700' },
                { icon: TrendingUp, label: 'Total Earnings', value: `Rs ${dashboard.total_earnings}`, iconWrap: 'bg-amber-100 text-amber-700' },
                { icon: Store, label: 'Listed Medicines', value: dashboard.medicines, iconWrap: 'bg-violet-100 text-violet-700' },
              ].map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <Card key={kpi.label}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${kpi.iconWrap}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">{kpi.label}</p>
                        <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Card className="xl:col-span-2">
                <h2 className="text-xl font-black mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="primary" size="md" className="justify-start">
                    <ClipboardList className="w-4 h-4 mr-2" /> Add Medicine
                  </Button>
                  <Button variant="secondary" size="md" className="justify-start">Manage Inventory</Button>
                  <Button variant="secondary" size="md" className="justify-start">Update Store Timings</Button>
                  <Button variant="secondary" size="md" className="justify-start">Order Support</Button>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-black mb-4">Performance Tips</h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2"><Timer className="w-4 h-4 mt-0.5 text-orange-600" /> Accept orders in under 3 minutes.</li>
                  <li className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 text-emerald-600" /> Keep stock synced to reduce cancellations.</li>
                  <li className="flex items-start gap-2"><TrendingUp className="w-4 h-4 mt-0.5 text-sky-600" /> Promote bundles to increase average order value.</li>
                </ul>
              </Card>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
};
