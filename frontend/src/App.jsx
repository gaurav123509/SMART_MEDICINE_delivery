import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { MedicineDetailsPage } from './pages/MedicineDetailsPage';

const getUserRole = () => localStorage.getItem('userRole');

const isAuthenticated = () => {
  const role = getUserRole();

  if (role === 'customer') {
    return Boolean(localStorage.getItem('userEmail'));
  }

  if (role === 'admin') {
    return Boolean(localStorage.getItem('adminEmail'));
  }

  return false;
};

const getDefaultRoute = () => {
  const role = getUserRole();
  if (role === 'admin') return '/admin/dashboard';
  return '/home';
};

const ProtectedRoute = ({ element }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

const RootRedirect = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultRoute()} replace />;
};

const LoginRoute = () => {
  if (isAuthenticated()) {
    return <Navigate to={getDefaultRoute()} replace />;
  }

  return <LoginPage />;
};

const introServices = ['Quick Appointment', '24x7 Orders', 'Medicine Service', 'Care Health', 'Best Doctors'];

const AppIntroOverlay = ({ exiting = false }) => (
  <div
    className={`fixed inset-0 z-[130] overflow-hidden bg-[#edf2ed] text-slate-900 transition-opacity duration-500 ${exiting ? 'opacity-0' : 'opacity-100'}`}
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_24%,rgba(255,255,255,0.98),transparent_34%),radial-gradient(circle_at_72%_22%,rgba(34,211,238,0.24),transparent_38%),radial-gradient(circle_at_70%_75%,rgba(45,212,191,0.22),transparent_32%)] animate-intro-v2-bg" />
    <div className="absolute inset-0 grid place-items-center px-4 sm:px-6">
      <div className="w-full max-w-6xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/70 shadow-[0_24px_70px_rgba(15,23,42,0.16)] bg-white/35 backdrop-blur-sm relative animate-intro-v2-frame">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.65),rgba(255,255,255,0.2))]" />
        <div className="absolute top-[8%] left-[6%] text-xs font-black uppercase tracking-[0.18em] text-cyan-800/85 animate-intro-v2-fade-up">
          Healthcare Marketplace
        </div>
        <div className="absolute top-[10%] left-[34%] h-1.5 w-28 bg-amber-400 rounded-full animate-intro-v2-line-left" />
        <div className="absolute top-[13%] left-[40%] h-1.5 w-36 bg-cyan-700 rounded-full animate-intro-v2-line-left-delay" />
        <div className="absolute top-[37%] right-0 h-2 w-44 bg-cyan-700/85 rounded-l-full animate-intro-v2-line-right" />
        <div className="absolute -left-[10%] top-[8%] h-[66%] w-[72%] bg-white/25 rounded-full blur-3xl animate-intro-v2-left-glow" />
        <div className="absolute left-[4%] bottom-[14%] w-[26%] h-[50%] rounded-t-[90px] rounded-b-[24px] bg-gradient-to-b from-[#9ad5ea] via-[#71bfd6] to-[#3c9cb8] shadow-[0_16px_36px_rgba(14,116,144,0.34)] animate-intro-v2-doctor-up" />
        <div className="absolute left-[6%] bottom-[53%] w-[14%] h-[14%] rounded-full bg-[#f4c6b0] shadow-[0_8px_18px_rgba(15,23,42,0.16)] animate-intro-v2-doctor-up" />

        <div className="absolute left-[34%] top-[18%] text-[#0c6f86] font-black leading-[0.88] animate-intro-v2-title">
          <div className="text-[clamp(2.2rem,4.8vw,5rem)]">YOUR</div>
          <div className="text-[clamp(2.2rem,4.8vw,5rem)]">HEALTH IS</div>
          <div className="text-[clamp(2.2rem,4.8vw,5rem)] text-[#e99a00]">OUR</div>
          <div className="text-[clamp(2.2rem,4.8vw,5rem)] text-[#e99a00]">PRIORITY</div>
        </div>

        <div className="absolute left-[34%] top-[63%] w-[58%] text-[clamp(0.7rem,1vw,1rem)] text-slate-700 animate-intro-v2-fade-up-delay">
          Effective relief, backed by pharmacists. Find essentials, compare prices, and order in minutes.
        </div>

        <div className="absolute left-0 right-0 bottom-0 h-[30%] bg-[#5d2f2f]/90 border-t border-white/20 animate-intro-v2-band-up">
          <div className="h-full grid grid-cols-2 gap-4 px-[6%] py-[4%] text-white">
            <div className="animate-intro-v2-fade-up-delay-2">
              <p className="text-[clamp(1rem,1.8vw,1.9rem)] font-black tracking-wide">MediHub</p>
              <p className="mt-1 text-[clamp(0.62rem,0.95vw,0.95rem)] text-slate-100/90 max-w-xs">
                Healthcare Made Simple, Safe, and Accessible
              </p>
            </div>
            <ul className="space-y-1 text-[clamp(0.62rem,0.95vw,0.98rem)] font-bold animate-intro-v2-fade-up-delay-3">
              {introServices.map((service) => (
                <li key={service} className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-300" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-cyan-700 via-teal-500 to-amber-400 animate-intro-v2-progress" />
        <div className="absolute inset-y-0 -left-28 w-20 bg-white/45 blur-2xl rotate-12 animate-intro-v2-sheen" />
      </div>
    </div>
  </div>
);

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [introExiting, setIntroExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setIntroExiting(true), 2500);
    const hideTimer = setTimeout(() => setShowIntro(false), 3000);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      {showIntro && <AppIntroOverlay exiting={introExiting} />}
      <Router>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login-preview" element={<LoginPage />} />
          <Route path="/login" element={<LoginRoute />} />

          <Route path="/home" element={<ProtectedRoute element={<HomePage />} />} />
          <Route path="/search" element={<ProtectedRoute element={<SearchPage />} />} />
          <Route path="/medicine/:id" element={<ProtectedRoute element={<MedicineDetailsPage />} />} />
          <Route path="/cart" element={<ProtectedRoute element={<CartPage />} />} />
          <Route path="/checkout" element={<ProtectedRoute element={<CheckoutPage />} />} />
          <Route path="/orders/:id" element={<ProtectedRoute element={<OrderTrackingPage />} />} />
          <Route path="/seller/dashboard" element={<ProtectedRoute element={<SellerDashboardPage />} />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute element={<AdminDashboardPage />} />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
