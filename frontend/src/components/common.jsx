import React from 'react';
import { Menu, X, MapPin, ShoppingCart, Search, Package, ShieldCheck, Truck } from 'lucide-react';
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
  const [deliveryLabel, setDeliveryLabel] = React.useState(localStorage.getItem('deliveryLocationLabel') || 'Noida 201301');
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
    const syncDelivery = () => {
      setDeliveryLabel(localStorage.getItem('deliveryLocationLabel') || 'Noida 201301');
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

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminProfile');
    window.dispatchEvent(new Event('auth-updated'));
    setMenuOpen(false);

    if (typeof onLogout === 'function') {
      onLogout();
      return;
    }

    navigate('/login');
  };

  const handleDeliverToClick = () => {
    if (!navigator.geolocation) {
      navigate('/home');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextLabel = `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`;
        localStorage.setItem('deliveryLocationLabel', nextLabel);
        window.dispatchEvent(new Event('delivery-location-updated'));
        navigate('/home');
      },
      () => {
        navigate('/home');
      }
    );
  };

  const accountRoute = auth.isLoggedIn
    ? (auth.role === 'admin' ? '/admin/dashboard' : '/orders/1')
    : '/login';
  const accountGreeting = auth.isLoggedIn ? `Hello, ${userName || auth.displayName}` : 'Hello, sign in';

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[var(--navy)] text-white text-xs">
        <div className="market-shell py-1.5 flex items-center justify-between">
          <p>Deal of the day: Flat 22% off on medicines above Rs 999</p>
          <p className="hidden md:block">Express delivery in 20 minutes in selected zones</p>
        </div>
      </div>

      <nav className="bg-[var(--navy)] border-b border-slate-800">
        <div className="market-shell py-2 flex items-center gap-2 md:gap-4">
          <Link to="/" className="flex items-center gap-2 text-white shrink-0 border border-transparent hover:border-white px-2 py-1 rounded">
            <div className="w-9 h-9 bg-[var(--brand)] text-black rounded-sm flex items-center justify-center font-black text-lg">
              m
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] text-slate-300 leading-none">health marketplace</p>
              <p className="font-extrabold text-base tracking-tight leading-tight">MediHub</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleDeliverToClick}
            className="hidden lg:flex items-center text-white text-sm gap-2 shrink-0 border border-transparent hover:border-white px-2 py-1 rounded"
          >
            <MapPin className="w-4 h-4" />
            <div>
              <p className="text-[11px] text-slate-300 leading-none">Deliver to</p>
              <p className="font-bold leading-none mt-1">{deliveryLabel}</p>
            </div>
          </button>

          <form onSubmit={handleHeaderSearch} className="flex-1">
            <div className="bg-white rounded-md overflow-hidden border-2 border-transparent focus-within:border-[var(--brand)] flex h-10">
              <select className="hidden md:block bg-slate-200 text-slate-700 text-sm px-2 border-r border-slate-300 outline-none">
                <option>All</option>
                <option>Medicines</option>
                <option>Wellness</option>
                <option>Supplements</option>
              </select>
              <input
                type="text"
                placeholder="Search medicines, wellness, diagnostics..."
                value={headerQuery}
                onChange={(e) => setHeaderQuery(e.target.value)}
                className="w-full px-4 text-sm outline-none"
              />
              <button type="submit" className="px-4 bg-[var(--brand)] hover:bg-[var(--brand-dark)] transition">
                <Search className="w-5 h-5 text-black" />
              </button>
            </div>
          </form>

          <div className="hidden md:flex items-end text-white gap-4 shrink-0">
            <Link to={accountRoute} className="text-sm border border-transparent hover:border-white px-2 py-1 rounded">
              <p className="text-[11px] text-slate-300">{accountGreeting}</p>
              <p className="font-bold leading-none">Account</p>
            </Link>
            <Link to="/orders/1" className="text-sm border border-transparent hover:border-white px-2 py-1 rounded">
              <p className="text-[11px] text-slate-300">Returns</p>
              <p className="font-bold leading-none">& Orders</p>
            </Link>
            {auth.isLoggedIn && (
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm border border-transparent hover:border-white px-2 py-1 rounded"
              >
                <p className="text-[11px] text-slate-300">Session</p>
                <p className="font-bold leading-none">Logout</p>
              </button>
            )}
            <Link to="/cart" className="relative flex items-end gap-1 font-bold border border-transparent hover:border-white px-2 py-1 rounded">
              <ShoppingCart className="w-8 h-8" />
              <span>Cart</span>
              <span className="absolute -top-0 left-4 text-[13px] font-black text-[var(--brand)]">
                {cartCount}
              </span>
            </Link>
          </div>

          <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <div className="bg-[var(--navy-2)] text-white border-b border-slate-700">
        <div className="market-shell py-2 flex items-center gap-5 text-sm overflow-x-auto whitespace-nowrap">
          <Link to="/home" className="hover:text-[var(--brand)]">Pharmacies</Link>
          <Link to="/search" className="hover:text-[var(--brand)]">Medicines</Link>
          <Link to="/cart" className="hover:text-[var(--brand)]">Cart</Link>
          <Link to="/seller/dashboard" className="hover:text-[var(--brand)]">Sell on MediHub</Link>
          <Link to="/admin/dashboard" className="hover:text-[var(--brand)]">Admin</Link>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 animate-slide-in">
          <div className="market-shell py-3 flex flex-col gap-2 text-sm">
            <Link to={accountRoute} className="py-1.5" onClick={() => setMenuOpen(false)}>
              {auth.isLoggedIn ? `Account (${userName || auth.displayName})` : 'Login / Sign up'}
            </Link>
            <Link to="/home" className="py-1.5" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/search" className="py-1.5" onClick={() => setMenuOpen(false)}>Medicines</Link>
            <Link to="/orders/1" className="py-1.5" onClick={() => setMenuOpen(false)}>Orders</Link>
            <Link to="/cart" className="py-1.5" onClick={() => setMenuOpen(false)}>Cart</Link>
            {auth.isLoggedIn && (
              <button type="button" className="py-1.5 text-left text-rose-600 font-semibold" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export const Footer = () => (
  <footer className="bg-[#232f3e] text-slate-200 mt-16">
    <div className="bg-[#37475a] text-center py-3 text-sm">Back to top</div>
    <div className="market-shell py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
      <div>
        <h4 className="font-bold text-white mb-3 text-base">Get to Know Us</h4>
        <p className="text-slate-400 leading-relaxed">
          Your online healthcare marketplace for quick medicine delivery from trusted local stores.
        </p>
      </div>
      <div>
        <h4 className="font-bold text-white mb-3 text-base">Customer Service</h4>
        <ul className="space-y-2 text-slate-400">
          <li><a href="/orders/1" className="hover:text-white">Track Order</a></li>
          <li><a href="/login" className="hover:text-white">Login & Security</a></li>
          <li><a href="#" className="hover:text-white">Return Policy</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-white mb-3 text-base">For Partners</h4>
        <ul className="space-y-2 text-slate-400">
          <li><a href="/seller/dashboard" className="hover:text-white">Seller Dashboard</a></li>
          <li><a href="#" className="hover:text-white">Delivery Partner</a></li>
          <li><a href="#" className="hover:text-white">Enterprise Supply</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-white mb-3 text-base">Why MediHub</h4>
        <ul className="space-y-2 text-slate-400">
          <li className="flex items-center gap-2"><Package className="w-4 h-4" /> 100k+ SKUs</li>
          <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Verified sellers</li>
          <li className="flex items-center gap-2"><Truck className="w-4 h-4" /> Fast local delivery</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-slate-700 py-4 text-center text-xs text-slate-400">
      © 2026 MediHub. All rights reserved.
    </div>
  </footer>
);

export const Button = ({ variant = 'primary', size = 'md', children, className = '', ...props }) => {
  const baseClasses = 'font-bold rounded-md transition disabled:opacity-60 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-[var(--brand)] text-[#111827] hover:bg-[var(--brand-dark)]',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    outline: 'border-2 border-[#d5d9d9] text-slate-700 hover:border-[#c7cccc] hover:bg-slate-50',
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
    <Card className="group hover:shadow-lg transition animate-rise rounded-lg">
      <div className="deal-badge inline-block mb-3">{offerText}</div>
      <Link to={`/medicine/${medicine.id}`} className="block">
        <div className="w-full h-36 rounded-md bg-slate-100 overflow-hidden flex items-center justify-center mb-3">
          <MedicineImage
            medicine={medicine}
            className="h-full w-full object-cover"
            alt={medicine.name}
          />
        </div>
        <h3 className="font-extrabold text-slate-900 text-lg leading-tight min-h-[54px] hover:underline">{medicine.name}</h3>
      </Link>
      <p className="text-slate-500 text-sm mt-1">
        {medicine.strength || 'General'} • {medicine.unit || 'unit'}
      </p>
      {medicine.use_for && (
        <p className="text-xs text-slate-600 mt-1">{medicine.use_for}</p>
      )}
      <p className="text-xs text-slate-500 mt-2">Sold by: {medicine.pharmacy_name || 'Nearby Pharmacy'}</p>

      <div className="flex items-end gap-2 mt-4">
        <span className="text-2xl font-extrabold text-slate-900">Rs {price}</span>
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
