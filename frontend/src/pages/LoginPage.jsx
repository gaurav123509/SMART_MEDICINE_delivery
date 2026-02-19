import React, { useState } from 'react';
import { Header, Footer, Button, AlertBox } from '../components/common';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('customer'); // customer | admin
  const [customerMode, setCustomerMode] = useState('login'); // login | signup
  const [adminMode, setAdminMode] = useState('signin'); // signin | signup
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');

  const [adminUserName, setAdminUserName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminMedicalName, setAdminMedicalName] = useState('');
  const [adminLicenseNo, setAdminLicenseNo] = useState('');
  const [adminAddress, setAdminAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetCustomerForm = () => {
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPassword('');
    setError('');
  };

  const resetAdminForm = () => {
    setAdminUserName('');
    setAdminEmail('');
    setAdminPassword('');
    setAdminMedicalName('');
    setAdminLicenseNo('');
    setAdminAddress('');
    setError('');
  };

  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    if (!customerEmail.trim() || !customerPassword.trim()) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authAPI.login({
        email: customerEmail.trim().toLowerCase(),
        password: customerPassword,
      });

      localStorage.setItem('userRole', 'customer');
      localStorage.setItem('userEmail', response?.data?.email || customerEmail.trim().toLowerCase());
      localStorage.setItem('userName', response?.data?.full_name || 'Customer');
      navigate('/home');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSignup = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!customerEmail.trim() || !customerPassword.trim()) {
      setError('Please enter email and password');
      return;
    }
    if (customerPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authAPI.signup({
        full_name: customerName.trim(),
        email: customerEmail.trim().toLowerCase(),
        password: customerPassword,
      });

      localStorage.setItem('userRole', 'customer');
      localStorage.setItem('userEmail', response?.data?.email || customerEmail.trim().toLowerCase());
      localStorage.setItem('userName', response?.data?.full_name || customerName.trim());
      navigate('/home');
    } catch (err) {
      setError(err?.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const persistAdminSession = (profile, email) => {
    localStorage.setItem('userRole', 'admin');
    localStorage.setItem('userName', profile.user_name || 'Admin');
    localStorage.setItem('adminEmail', email);
    localStorage.setItem('adminProfile', JSON.stringify(profile));
    window.dispatchEvent(new Event('auth-updated'));
    navigate('/admin/dashboard');
  };

  const readAdminAccounts = () => {
    try {
      const raw = localStorage.getItem('adminAccounts');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  };

  const handleAdminSignIn = (e) => {
    e.preventDefault();
    const email = adminEmail.trim().toLowerCase();
    const password = adminPassword.trim();

    if (!email || !password) {
      setError('Please enter admin email and password');
      return;
    }

    if (email === 'admin@medihub.com' && password === 'admin123') {
      const existingProfileRaw = localStorage.getItem('adminProfile');
      let profile = null;
      try {
        if (existingProfileRaw) profile = JSON.parse(existingProfileRaw);
      } catch (_err) {
        // ignore
      }
      if (!profile || !profile.medical_name) {
        profile = {
          user_name: 'Admin',
          email,
          medical_name: 'MediHub Medical Store',
          license_no: 'LIC-DEMO-001',
          address: 'Noida',
        };
      }
      setError('');
      persistAdminSession(profile, email);
      return;
    }

    const accounts = readAdminAccounts();
    const account = accounts.find((x) => x.email === email && x.password === password);
    if (!account) {
      setError('Invalid admin credentials');
      return;
    }

    setError('');
    persistAdminSession(
      {
        user_name: account.user_name,
        email: account.email,
        medical_name: account.medical_name,
        license_no: account.license_no,
        address: account.address,
      },
      account.email
    );
  };

  const handleAdminSignUp = (e) => {
    e.preventDefault();
    const userName = adminUserName.trim();
    const email = adminEmail.trim().toLowerCase();
    const password = adminPassword.trim();
    const medicalName = adminMedicalName.trim();
    const licenseNo = adminLicenseNo.trim();
    const address = adminAddress.trim();

    if (!userName || !email || !password || !medicalName || !licenseNo || !address) {
      setError('Please fill all admin details');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const accounts = readAdminAccounts();
    if (accounts.some((x) => x.email === email)) {
      setError('Admin email already exists. Please sign in.');
      return;
    }

    const nextAccounts = [
      ...accounts,
      {
        user_name: userName,
        email,
        password,
        medical_name: medicalName,
        license_no: licenseNo,
        address,
      },
    ];
    localStorage.setItem('adminAccounts', JSON.stringify(nextAccounts));
    setError('');
    persistAdminSession(
      {
        user_name: userName,
        email,
        medical_name: medicalName,
        license_no: licenseNo,
        address,
      },
      email
    );
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white/90 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition';

  return (
    <>
      <Header />
      <main className="market-shell py-8 md:py-12">
        <section className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 md:p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-bold">Account Access</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-1">Login to MediHub</h2>
          <p className="text-slate-600 mt-2 text-sm md:text-base">Continue as customer or pharmacy admin.</p>

          <div className="mt-6 inline-flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => {
                setLoginType('customer');
                setError('');
              }}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition ${
                loginType === 'customer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('admin');
                setError('');
                setAdminMode('signin');
              }}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition ${
                loginType === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>

          {error && <div className="mt-4"><AlertBox type="error">{error}</AlertBox></div>}

          {loginType === 'customer' && (
            <div className="mt-5">
              <div className="inline-flex bg-slate-100 p-1 rounded-xl gap-1 mb-5">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                    customerMode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => {
                    setCustomerMode('login');
                    setError('');
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                    customerMode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => {
                    setCustomerMode('signup');
                    setError('');
                  }}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={customerMode === 'login' ? handleCustomerLogin : handleCustomerSignup}>
                {customerMode === 'signup' && (
                  <div className="mb-4">
                    <label className="block text-sm text-slate-700 font-semibold mb-1.5">Name</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm text-slate-700 font-semibold mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-slate-700 font-semibold mb-1.5">Password</label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <Button variant="primary" size="lg" className="w-full" disabled={loading}>
                  {loading
                    ? (customerMode === 'login' ? 'Logging in...' : 'Creating account...')
                    : (customerMode === 'login' ? 'Login' : 'Create Account')}
                </Button>
              </form>

              <p className="text-slate-600 text-sm mt-5">
                {customerMode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  className="text-sky-700 font-bold"
                  onClick={() => {
                    setCustomerMode(customerMode === 'login' ? 'signup' : 'login');
                    resetCustomerForm();
                  }}
                  disabled={loading}
                >
                  {customerMode === 'login' ? 'Sign up' : 'Login'}
                </button>
              </p>
            </div>
          )}

          {loginType === 'admin' && (
            <div className="mt-5">
              <div className="inline-flex bg-slate-100 p-1 rounded-xl gap-1 mb-5">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                    adminMode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => {
                    setAdminMode('signin');
                    setError('');
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                    adminMode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => {
                    setAdminMode('signup');
                    setError('');
                  }}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={adminMode === 'signin' ? handleAdminSignIn : handleAdminSignUp}>
                {adminMode === 'signup' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-700 font-semibold mb-1.5">Admin User Name</label>
                        <input
                          type="text"
                          placeholder="Enter admin user name"
                          value={adminUserName}
                          onChange={(e) => setAdminUserName(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-700 font-semibold mb-1.5">Medical Name</label>
                        <input
                          type="text"
                          placeholder="ABC Medical Store"
                          value={adminMedicalName}
                          onChange={(e) => setAdminMedicalName(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm text-slate-700 font-semibold mb-1.5">License No.</label>
                        <input
                          type="text"
                          placeholder="LIC-123456"
                          value={adminLicenseNo}
                          onChange={(e) => setAdminLicenseNo(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-700 font-semibold mb-1.5">Address</label>
                        <input
                          type="text"
                          placeholder="Enter medical store address"
                          value={adminAddress}
                          onChange={(e) => setAdminAddress(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className={`grid grid-cols-1 ${adminMode === 'signup' ? 'md:grid-cols-2' : ''} gap-4 mt-4`}>
                  <div>
                    <label className="block text-sm text-slate-700 font-semibold mb-1.5">Admin Email</label>
                    <input
                      type="email"
                      placeholder="admin@medihub.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 font-semibold mb-1.5">Password</label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <Button variant="primary" size="lg" className="w-full mt-6" disabled={loading}>
                  {adminMode === 'signin' ? 'Sign In as Admin' : 'Create Admin Account'}
                </Button>
              </form>

              <p className="text-xs text-slate-500 mt-3 inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Demo sign in: <span className="font-semibold">admin@medihub.com / admin123</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {adminMode === 'signin' ? "Don't have an admin account?" : 'Already registered as admin?'}{' '}
                <button
                  type="button"
                  className="text-sky-700 font-bold"
                  onClick={() => {
                    setAdminMode(adminMode === 'signin' ? 'signup' : 'signin');
                    resetAdminForm();
                  }}
                  disabled={loading}
                >
                  {adminMode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};
