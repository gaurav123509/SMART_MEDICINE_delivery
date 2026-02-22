import React from 'react';
import { Menu, X, MapPin, ShoppingCart, Search, Package, ShieldCheck, Truck, UserCircle2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCartCount } from '../utils/cart';

const readAuthState = () => {
  const role = localStorage.getItem('userRole');
  const customerEmail = localStorage.getItem('userEmail');
  const adminEmail = localStorage.getItem('adminEmail');
  const storedName = localStorage.getItem('userName');
  const isLoggedIn = (role === 'customer' && Boolean(customerEmail)) || (role === 'admin' && Boolean(adminEmail));
  const defaultRoute = role === 'admin' ? '/admin/dashboard' : '/home';
  return {
    role,
    isLoggedIn,
    defaultRoute,
    displayName: storedName || (role === 'admin' ? 'Admin' : 'Customer'),
  };
};

const MEDICINE_PLACEHOLDER = '/medicine-placeholder.svg';
const DEFAULT_DELIVERY_LABEL = 'Satna 485001';

const buildCompoundImageUrl = (name) => {
  const safe = (name || '').trim().toLowerCase();
  const aliasMap = {
    dolo: 'paracetamol',
    crocin: 'paracetamol',
    calpol: 'paracetamol',
    'vitamin c': 'ascorbic acid',
    'vitamin d3': 'cholecalciferol',
    zincovit: 'zinc sulfate',
    ors: 'oral rehydration salts',
  };
  const queryName = encodeURIComponent(aliasMap[safe] || safe || 'medicine');
  return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${queryName}/PNG?image_size=large`;
};

export const MedicineImage = ({ medicine, className, alt, loading = 'lazy' }) => {
  const candidates = React.useMemo(() => {
    const list = [
      (medicine?.image_url || '').trim(),
      buildCompoundImageUrl(medicine?.name),
      MEDICINE_PLACEHOLDER,
    ];
    return list.filter((value, index) => value && list.indexOf(value) === index);
  }, [medicine?.image_url, medicine?.name]);
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    setIndex(0);
  }, [candidates]);

  const src = candidates[Math.min(index, candidates.length - 1)] || MEDICINE_PLACEHOLDER;

  return (
    <img
      src={src}
      alt={alt || medicine?.name || 'Medicine image'}
      className={className}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => {
        setIndex((current) => (current < candidates.length - 1 ? current + 1 : current));
      }}
    />
  );
};

export const Header = ({ userType = 'customer', userName = null, onLogout }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [cartCount, setCartCount] = React.useState(getCartCount());
  const [headerQuery, setHeaderQuery] = React.useState('');
  const [auth, setAuth] = React.useState(readAuthState());
  const [deliveryLabel, setDeliveryLabel] = React.useState(localStorage.getItem('deliveryLocationLabel') || DEFAULT_DELIVERY_LABEL);
  const [locating, setLocating] = React.useState(false);
  const [locationHint, setLocationHint] = React.useState('');
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const sync = () => setCartCount(getCartCount());
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('cart-updated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('cart-updated', sync);
    };
  }, []);

  React.useEffect(() => {
    const query = new URLSearchParams(location.search).get('q') || '';
    setHeaderQuery(query);
  }, [location.pathname, location.search]);

  React.useEffect(() => {
    const syncAuth = () => setAuth(readAuthState());
    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('auth-updated', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('auth-updated', syncAuth);
    };
  }, [location.pathname]);

  React.useEffect(() => {
    if (!localStorage.getItem('deliveryLocationLabel')) {
      localStorage.setItem('deliveryLocationLabel', DEFAULT_DELIVERY_LABEL);
    }
    const syncDelivery = () => {
      setDeliveryLabel(localStorage.getItem('deliveryLocationLabel') || DEFAULT_DELIVERY_LABEL);
    };
    syncDelivery();
    window.addEventListener('storage', syncDelivery);
    window.addEventListener('delivery-location-updated', syncDelivery);
    return () => {
      window.removeEventListener('storage', syncDelivery);
      window.removeEventListener('delivery-location-updated', syncDelivery);
    };
  }, []);

  const handleHeaderSearch = (e) => {
    e.preventDefault();
    const q = headerQuery.trim();
    if (!q) {
      navigate('/search');
      return;
    }
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleDeliverToClick = () => {
    if (locating) return;

    if (!navigator.geolocation) {
      setLocationHint('Location not supported');
      return;
    }

    setLocating(true);
    setLocationHint('Updating location...');

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextLabel = `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`;
        localStorage.setItem('deliveryLocationLabel', nextLabel);
        window.dispatchEvent(new Event('delivery-location-updated'));
        setDeliveryLabel(nextLabel);
        setLocationHint('Location updated');
        setLocating(false);
        setTimeout(() => setLocationHint(''), 1800);
      },
      () => {
        setLocationHint('Allow location permission');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const accountRoute = auth.isLoggedIn
    ? '/profile'
    : '/login';
  const accountGreeting = auth.isLoggedIn ? `Hi, ${userName || auth.displayName}` : 'Sign in';
  const navLinks = [
    { label: 'Home', to: '/home' },
    { label: 'Discover', to: '/search' },
    { label: 'Care Kit', to: '/cart' },
    { label: 'Orders', to: '/orders/1' },
    { label: 'Partners', to: '/seller/dashboard' },
  ];

  return (
    <header className="sticky top-0 z-50 px-2 pt-2 md:px-4 md:pt-3">
      <div className="relative overflow-hidden rounded-[28px] border border-[#9edaf5]/50 bg-[linear-gradient(125deg,#031327_0%,#09305f_40%,#0a6a74_100%)] shadow-[0_18px_48px_rgba(3,15,34,0.45)]">
        <div className="absolute -top-12 right-12 h-40 w-40 rounded-full bg-[#22d3ee]/25 blur-3xl" />
        <div className="absolute -bottom-8 left-10 h-32 w-32 rounded-full bg-[#34d399]/20 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.06),transparent_45%)]" />

        <div className="market-shell relative py-3">
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/" className="flex items-center gap-2 text-white shrink-0">
              <div className="h-11 w-11 rounded-2xl border border-cyan-100/40 bg-white/15 backdrop-blur-sm grid place-items-center text-base font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                MH
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-100/85 leading-none">smart care network</p>
                <p className="font-extrabold text-lg brand-heading leading-tight text-white">MediHub</p>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleDeliverToClick}
              className="hidden md:flex items-center text-white text-sm gap-2 rounded-2xl border border-cyan-100/25 bg-white/10 px-2.5 py-2 hover:bg-white/15 transition backdrop-blur-sm disabled:opacity-70"
              disabled={locating}
            >
              <MapPin className="w-4 h-4 text-cyan-100" />
              <div>
                <p className="text-[11px] text-cyan-100/80 leading-none">{locationHint || 'Delivering to'}</p>
                <p className="font-bold leading-none mt-1 max-w-32 truncate">{deliveryLabel}</p>
              </div>
            </button>

            <form onSubmit={handleHeaderSearch} className="flex-1">
              <div className="h-11 rounded-full border border-cyan-100/35 bg-white/95 flex items-center overflow-hidden focus-within:ring-2 focus-within:ring-cyan-300/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                <input
                  type="text"
                  placeholder="Search medicines, symptoms, supplements..."
                  value={headerQuery}
                  onChange={(e) => setHeaderQuery(e.target.value)}
                  className="w-full px-4 text-sm outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
                />
                <button type="submit" className="h-full px-4 bg-[linear-gradient(145deg,#f97316,#ea580c)] hover:brightness-110 transition">
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>
            </form>

            <div className="hidden md:flex items-center gap-2 text-white">
              <Link
                to={accountRoute}
                className="group rounded-2xl px-2.5 py-1.5 bg-white/10 border border-white/15 hover:bg-white/18 transition text-sm font-semibold backdrop-blur-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="h-8 w-8 rounded-xl bg-white/18 border border-white/20 grid place-items-center">
                    <UserCircle2 className="w-4 h-4 text-cyan-100" />
                  </span>
                  <span className="pr-1 text-cyan-50 group-hover:text-white transition">{accountGreeting}</span>
                </span>
              </Link>
              <Link to="/cart" className="relative rounded-xl px-3 py-2 bg-gradient-to-r from-white/15 to-white/10 border border-white/20 hover:from-white/25 hover:to-white/18 transition text-sm font-semibold flex items-center gap-2 backdrop-blur-sm">
                <ShoppingCart className="w-4 h-4" />
                <span>Cart</span>
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white grid place-items-center text-[11px] font-black">
                  {cartCount}
                </span>
              </Link>
            </div>

            <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>

          <div className="mt-3 hidden md:flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full border border-cyan-100/25 bg-white/10 backdrop-blur-sm px-2 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-full px-4 py-1.5 text-sm font-semibold text-cyan-50/90 hover:bg-white/16 hover:text-white transition"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/admin/dashboard"
                className="rounded-full px-4 py-1.5 text-sm font-semibold text-cyan-50/90 hover:bg-white/16 hover:text-white transition"
              >
                Admin
              </Link>
            </div>
            <p className="text-xs text-cyan-100/85">Emergency essentials in under 30 minutes for selected zones.</p>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white/95 border-t border-cyan-100/50 animate-slide-in">
            <div className="market-shell py-3 flex flex-col gap-2 text-sm">
              <Link to={accountRoute} className="py-1.5 font-semibold" onClick={() => setMenuOpen(false)}>
                {auth.isLoggedIn ? `Profile (${userName || auth.displayName})` : 'Login / Sign up'}
              </Link>
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className="py-1.5" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <Link to="/admin/dashboard" className="py-1.5" onClick={() => setMenuOpen(false)}>
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export const Footer = () => (
  <footer className="mt-16 px-2 pb-2 md:px-4 md:pb-4">
    <div className="rounded-3xl border border-[#c7e7f7] bg-[linear-gradient(138deg,#061d3a_0%,#0a2f57_48%,#174f60_100%)] text-slate-100 shadow-[0_18px_44px_rgba(6,18,42,0.34)] overflow-hidden">
      <div className="market-shell py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm relative">
        <div className="absolute -top-10 right-8 h-28 w-28 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="absolute bottom-2 left-10 h-24 w-24 rounded-full bg-rose-400/20 blur-2xl" />
        <div className="relative">
          <h4 className="font-black text-white mb-3 text-lg brand-heading">MediHub</h4>
          <p className="text-slate-200/80 leading-relaxed">
            Digital-first healthcare marketplace for urgent medicine delivery and ongoing family care routines.
          </p>
        </div>
        <div className="relative">
          <h4 className="font-bold text-white mb-3 text-base">Customer Care</h4>
          <ul className="space-y-2 text-slate-200/80">
            <li><a href="/orders/1" className="hover:text-white">Track Order</a></li>
            <li><a href="/login" className="hover:text-white">Login & Security</a></li>
            <li><a href="#" className="hover:text-white">Return Policy</a></li>
          </ul>
        </div>
        <div className="relative">
          <h4 className="font-bold text-white mb-3 text-base">For Partners</h4>
          <ul className="space-y-2 text-slate-200/80">
            <li><a href="/seller/dashboard" className="hover:text-white">Seller Dashboard</a></li>
            <li><a href="#" className="hover:text-white">Delivery Partner</a></li>
            <li><a href="#" className="hover:text-white">Enterprise Supply</a></li>
          </ul>
        </div>
        <div className="relative">
          <h4 className="font-bold text-white mb-3 text-base">Why MediHub</h4>
          <ul className="space-y-2 text-slate-200/80">
            <li className="flex items-center gap-2"><Package className="w-4 h-4" /> 100k+ SKUs</li>
            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Verified sellers</li>
            <li className="flex items-center gap-2"><Truck className="w-4 h-4" /> Fast local delivery</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15 py-4 text-center text-xs text-slate-200/75">
        © 2026 MediHub. All rights reserved.
      </div>
    </div>
  </footer>
);

export const Button = ({ variant = 'primary', size = 'md', children, className = '', ...props }) => {
  const baseClasses = 'font-bold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-gradient-to-r from-[#0f766e] to-[#0284c7] text-white hover:brightness-110',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    outline: 'border border-slate-300 text-slate-700 hover:border-cyan-500 hover:text-cyan-700 hover:bg-cyan-50',
  };
  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
};

export const Card = ({ children, className = '' }) => (
  <div className={`surface-card p-5 ${className}`}>{children}</div>
);

export const MedicineCard = ({ medicine, onAddToCart }) => {
  const price = Number(medicine.price || 0);
  const mrp = Number(medicine.mrp || Math.round(price * 1.2));
  const offPercent = Number.isFinite(Number(medicine.offer_percent))
    ? Number(medicine.offer_percent)
    : (mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0);
  const offerText = medicine.offer_text || (offPercent > 0 ? `${offPercent}% OFF` : 'Best Price');
  return (
    <Card className="group hover:shadow-xl transition animate-rise rounded-2xl border-cyan-100/80">
      <div className="deal-badge inline-block mb-3">{offerText}</div>
      <Link to={`/medicine/${medicine.id}`} className="block">
        <div className="w-full h-36 rounded-xl bg-gradient-to-br from-cyan-50 to-slate-100 overflow-hidden flex items-center justify-center mb-3">
          <MedicineImage
            medicine={medicine}
            className="h-full w-full object-cover"
            alt={medicine.name}
          />
        </div>
        <h3 className="font-extrabold text-slate-900 text-lg leading-tight min-h-[54px] group-hover:text-cyan-800 transition">{medicine.name}</h3>
      </Link>
      <p className="text-slate-500 text-sm mt-1">
        {medicine.strength || 'General'} • {medicine.unit || 'unit'}
      </p>
      {medicine.use_for && (
        <p className="text-xs text-slate-600 mt-1">{medicine.use_for}</p>
      )}
      <p className="text-xs text-slate-500 mt-2">Sold by: {medicine.pharmacy_name || 'Nearby Pharmacy'}</p>

      <div className="flex items-end gap-2 mt-4">
        <span className="text-2xl font-extrabold text-slate-900">Rs {price.toFixed(2)}</span>
        <span className="text-sm text-slate-400 line-through">Rs {mrp}</span>
        {offPercent > 0 && <span className="text-xs font-bold text-emerald-700">({offPercent}% OFF)</span>}
      </div>

      <p className="text-xs text-emerald-700 mt-1 font-semibold">
        {medicine.available ? 'In stock • Delivery by today' : 'Out of stock'}
      </p>

      <Link to={`/medicine/${medicine.id}`} className="block mt-3 text-xs font-bold amazon-link">
        View details
      </Link>

      <Button
        variant="primary"
        size="md"
        className="w-full mt-3 rounded-full"
        onClick={() => onAddToCart(medicine)}
        disabled={!medicine.available}
      >
        Add to Cart
      </Button>
    </Card>
  );
};

export const PharmacyCard = ({ pharmacy, onSelect }) => (
  <Card className="hover:shadow-xl transition cursor-pointer">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="font-extrabold text-lg">{pharmacy.name}</h3>
        <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {pharmacy.location || 'Nearby'} • {pharmacy.distance_km ?? '--'} km
        </p>
      </div>
      <span className="text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full px-2 py-1">
        ★ {pharmacy.rating || 4.5}
      </span>
    </div>
    <p className="text-sm text-slate-600 mb-4">{pharmacy.medicines_count || 0}+ medicines available</p>
    <Button variant="outline" size="md" onClick={() => onSelect(pharmacy)} className="w-full">
      View Medicines
    </Button>
  </Card>
);

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-14">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[var(--brand)]"></div>
  </div>
);

export const AlertBox = ({ type = 'info', children }) => {
  const colors = {
    info: 'bg-sky-50 text-sky-800 border-sky-300',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    error: 'bg-rose-50 text-rose-800 border-rose-300',
    warning: 'bg-amber-50 text-amber-800 border-amber-300',
  };
  return (
    <div className={`border-l-4 p-4 rounded-md ${colors[type]}`}>
      {children}
    </div>
  );
};
