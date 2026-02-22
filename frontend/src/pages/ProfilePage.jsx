import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header, Footer, Button, Card, AlertBox } from '../components/common';

const readProfileState = () => {
  const role = localStorage.getItem('userRole') || 'customer';
  const userName = localStorage.getItem('userName') || (role === 'admin' ? 'Admin' : 'Customer');
  const userEmail = localStorage.getItem('userEmail') || '';
  const adminEmail = localStorage.getItem('adminEmail') || '';
  let adminProfile = null;
  try {
    adminProfile = JSON.parse(localStorage.getItem('adminProfile') || 'null');
  } catch (_err) {
    adminProfile = null;
  }

  return {
    role,
    userName,
    email: role === 'admin' ? adminEmail : userEmail,
    adminProfile,
  };
};

export const ProfilePage = () => {
  const navigate = useNavigate();
  const profile = readProfileState();

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminProfile');
    window.dispatchEvent(new Event('auth-updated'));
    navigate('/login');
  };

  return (
    <>
      <Header userType={profile.role} userName={profile.userName} />
      <main className="market-shell py-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-bold">Account Center</p>
          <h1 className="text-3xl font-black mt-1 brand-heading text-[#0d2f56]">My Profile</h1>

          {!profile.email && (
            <div className="mt-4">
              <AlertBox type="warning">Profile details are incomplete. Please login again.</AlertBox>
            </div>
          )}

          <Card className="mt-5 border-cyan-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 font-semibold">Name</p>
                <p className="text-slate-900 font-black mt-1">{profile.userName}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Role</p>
                <p className="text-slate-900 font-black mt-1 capitalize">{profile.role}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-slate-500 font-semibold">Email</p>
                <p className="text-slate-900 font-black mt-1">{profile.email || 'Not available'}</p>
              </div>
              {profile.role === 'admin' && profile.adminProfile && (
                <>
                  <div>
                    <p className="text-slate-500 font-semibold">Medical Name</p>
                    <p className="text-slate-900 font-black mt-1">{profile.adminProfile.medical_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-semibold">License No.</p>
                    <p className="text-slate-900 font-black mt-1">{profile.adminProfile.license_no || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-500 font-semibold">Address</p>
                    <p className="text-slate-900 font-black mt-1">{profile.adminProfile.address || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {profile.role === 'admin' ? (
                <Link to="/admin/dashboard">
                  <Button variant="outline">Go to Admin Dashboard</Button>
                </Link>
              ) : (
                <Link to="/orders/1">
                  <Button variant="outline">Track Order</Button>
                </Link>
              )}
              <Button variant="primary" onClick={handleLogout}>Logout</Button>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
};

