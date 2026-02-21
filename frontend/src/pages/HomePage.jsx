import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Header, Footer, Button, AlertBox, LoadingSpinner, MedicineImage } from '../components/common';
import { pharmacyAPI, medicineAPI, supportAPI } from '../services/api';
import { addToCart } from '../utils/cart';
import {
  ArrowRight,
  HelpCircle,
  Clock3,
  Heart,
  MapPin,
  Pill,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Stethoscope,
  Truck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const categoryCards = [
  { key: 'Everyday', emoji: '🪥', color: 'from-[#fef3c7] to-[#fde68a]' },
  { key: 'Vitamins', emoji: '💊', color: 'from-[#e0f2fe] to-[#bae6fd]' },
  { key: 'First Aid', emoji: '🩹', color: 'from-[#fee2e2] to-[#fecaca]' },
  { key: 'Personal Care', emoji: '🧴', color: 'from-[#fae8ff] to-[#f5d0fe]' },
  { key: 'Women Health', emoji: '🌸', color: 'from-[#ffe4e6] to-[#fecdd3]' },
  { key: 'Baby Care', emoji: '🍼', color: 'from-[#dcfce7] to-[#bbf7d0]' },
];

const trustBrands = ['Garden of Life', 'vida', 'obit', 'Capsugel', 'CarePro', 'loopa', 'Pharmacy Plus'];
const supportQuickActions = [
  'Track my order',
  'Suggest fever medicines',
  'Best vitamins available',
  'Help for baby care products',
];
const initialServiceRequestForm = {
  full_name: '',
  phone: '',
  preferred_time: '',
  notes: '',
};

const ServiceRequestModal = ({
  open,
  title,
  subtitle,
  submitLabel,
  formData,
  setFormData,
  onClose,
  onSubmit,
  submitting,
  error,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] bg-black/45 grid place-items-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold text-slate-500 hover:text-slate-700"
          >
            Close
          </button>
        </div>

        {error && <div className="mt-3"><AlertBox type="error">{error}</AlertBox></div>}

        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
              className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:border-[#0a6a5b]"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:border-[#0a6a5b]"
              placeholder="10 digit mobile number"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Preferred Time</label>
            <input
              type="text"
              value={formData.preferred_time}
              onChange={(e) => setFormData((prev) => ({ ...prev, preferred_time: e.target.value }))}
              className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:border-[#0a6a5b]"
              placeholder="Example: 6 PM - 8 PM"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Notes (Optional)</label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-[#0a6a5b]"
              placeholder="Any symptoms or preference details..."
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Submitting...' : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProductMiniCard = ({ medicine, onAdd }) => {
  const price = Number(medicine.price || 0);
  const mrp = Number(medicine.mrp || Math.round(price * 1.2));
  const offPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition animate-rise">
      <Link to={`/medicine/${medicine.id}`} className="block">
        <div className="relative rounded-xl bg-slate-50 h-40 overflow-hidden flex items-center justify-center">
          {offPercent > 0 && (
            <span className="absolute left-2 top-2 text-[10px] font-black px-2 py-1 rounded-full bg-rose-100 text-rose-700">
              -{offPercent}%
            </span>
          )}
          <span className="absolute right-2 top-2 w-7 h-7 rounded-full border border-slate-200 bg-white grid place-items-center text-slate-500">
            <Heart className="w-3.5 h-3.5" />
          </span>
          <MedicineImage
            medicine={medicine}
            alt={medicine.name}
            className="h-full w-full object-cover"
          />
        </div>
      </Link>

      <p className="text-xs mt-3 font-bold text-emerald-700">Rs {price.toFixed(2)}</p>
      <Link to={`/medicine/${medicine.id}`} className="block">
        <h3 className="font-extrabold text-slate-900 leading-tight mt-1 line-clamp-2 min-h-[42px] hover:underline">{medicine.name}</h3>
      </Link>
      <p className="text-[11px] text-slate-500 line-clamp-1">{medicine.strength || 'General use'} • {medicine.unit || 'unit'}</p>
      <p className="text-[11px] text-slate-400 mt-1 line-through">Rs {mrp.toFixed(2)}</p>

      <div className="flex items-center gap-1 mt-2 text-amber-500">
        {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-3 h-3 fill-current" />)}
        <span className="text-[11px] text-slate-500 ml-1">4.8</span>
      </div>

      <Button size="sm" variant="outline" className="w-full mt-3 rounded-full text-xs" onClick={() => onAdd(medicine)}>
        Add to Cart
      </Button>
    </article>
  );
};

export const HomePage = () => {
  const navigate = useNavigate();
  const supportSectionRef = useRef(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState(initialServiceRequestForm);
  const [walkInForm, setWalkInForm] = useState(initialServiceRequestForm);
  const [scheduleError, setScheduleError] = useState('');
  const [walkInError, setWalkInError] = useState('');
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [walkInSubmitting, setWalkInSubmitting] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      role: 'ai',
      text: 'Hi, I am MediHub AI Support. Ask me about medicines, categories, or order tracking.',
    },
  ]);

  const syncDeliveryLocation = (lat, lng) => {
    const label = `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
    localStorage.setItem('deliveryLocationLabel', label);
    window.dispatchEvent(new Event('delivery-location-updated'));
  };

  const requestCurrentLocation = ({ showStatus = false } = {}) => {
    if (!navigator.geolocation) {
      if (showStatus) {
        setError('Location is not supported in this browser.');
      }
      fetchDashboardData();
      return;
    }

    if (showStatus) {
      setMessage('Fetching your current location...');
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        setLocation({ lat: latitude, lng: longitude });
        syncDeliveryLocation(latitude, longitude);
        fetchDashboardData(latitude, longitude);
        if (showStatus) {
          setMessage(`Delivery location updated: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        }
      },
      () => {
        if (showStatus) {
          setError('Location access denied. Please allow location permission.');
        } else {
          setError('Location access denied. Showing general nearby stores.');
        }
        fetchDashboardData();
      }
    );
  };

  useEffect(() => {
    requestCurrentLocation();
  }, []);

  const fetchDashboardData = async (lat, lng) => {
    setLoading(true);
    try {
      const [pharmacyRes, medicineRes] = await Promise.all([
        pharmacyAPI.nearby(lat, lng),
        medicineAPI.search(''),
      ]);
      setPharmacies(pharmacyRes?.data?.pharmacies || []);
      setMedicines(medicineRes?.data?.results || []);
    } catch (_err) {
      setError('Failed to load marketplace data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const featured = useMemo(() => medicines.slice(0, 8), [medicines]);
  const bestSellers = useMemo(() => medicines.slice(8, 16), [medicines]);
  const spotlightMedicine = useMemo(() => {
    const keywords = ['pain relief', 'ibuprofen', 'paracetamol', 'dolo', 'crocin'];
    const exact = medicines.find((item) =>
      keywords.some((keyword) => (item.name || '').toLowerCase().includes(keyword))
    );
    return exact || medicines[0] || null;
  }, [medicines]);

  const handleAddToCart = (medicine) => {
    const result = addToCart(medicine);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage(`${medicine.name} added to cart`);
  };

  const handleBestSellerAdd = () => {
    if (spotlightMedicine) {
      handleAddToCart(spotlightMedicine);
      return;
    }
    navigate('/search?q=Pain%20Relief');
  };

  const handleHomeSearch = (e) => {
    e.preventDefault();
    const q = homeSearchQuery.trim();
    if (!q) {
      navigate('/search');
      return;
    }
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const getCatalogSuggestions = (terms, limit = 3) => {
    const lowerTerms = terms.map((t) => t.toLowerCase());
    return medicines
      .filter((m) => {
        const name = (m.name || '').toLowerCase();
        const category = (m.category || '').toLowerCase();
        return lowerTerms.some((term) => name.includes(term) || category.includes(term));
      })
      .slice(0, limit);
  };

  const generateAiReply = (question) => {
    const q = question.toLowerCase();

    if (q.includes('track') || q.includes('order') || q.includes('delivery')) {
      return 'Order track karne ke liye top menu se Orders open karo ya /orders/1 pe jao. Wahan live delivery status, ETA, aur partner updates mil jayenge.';
    }

    if (q.includes('fever') || q.includes('cold') || q.includes('pain')) {
      const picks = getCatalogSuggestions(['paracetamol', 'dolo', 'crocin', 'pain relief', 'antihistamine']);
      if (picks.length > 0) {
        return `Fever/Pain ke liye ye options dekh sakte ho: ${picks.map((p) => p.name).join(', ')}. Search page par jaake symptoms/type se compare kar lo.`;
      }
      return 'Fever/Pain ke liye Search me Paracetamol, Dolo, Crocin ya Pain Relief products try karo.';
    }

    if (q.includes('vitamin') || q.includes('supplement') || q.includes('immunity')) {
      const picks = getCatalogSuggestions(['vitamin', 'supplement', 'immunity']);
      if (picks.length > 0) {
        return `Vitamins & Supplements se recommended products: ${picks.map((p) => p.name).join(', ')}.`;
      }
      return 'Vitamins ke liye category chips me "Vitamins" select karo ya search me "vitamin" likho.';
    }

    if (q.includes('baby')) {
      const picks = getCatalogSuggestions(['baby']);
      if (picks.length > 0) {
        return `Baby Care me ye products available hain: ${picks.map((p) => p.name).join(', ')}.`;
      }
      return 'Baby Care ke liye search me "baby" likho, ya home page se Baby Care category open karo.';
    }

    if (q.includes('women') || q.includes('period') || q.includes('pregnancy')) {
      const picks = getCatalogSuggestions(['women', 'period', 'prenatal', 'iron']);
      if (picks.length > 0) {
        return `Women Health ke options: ${picks.map((p) => p.name).join(', ')}.`;
      }
      return 'Women Health ke liye search me women/period/prenatal keywords use karo.';
    }

    const general = getCatalogSuggestions([q], 2);
    if (general.length > 0) {
      return `Mujhe catalog me ye matching items mile: ${general.map((p) => p.name).join(', ')}. Kya inme se kisi ka detail chahiye?`;
    }

    return 'Main help ke liye ready hoon. Aap medicine name, category (Everyday, Vitamins, Baby Care), ya order tracking query bhejo.';
  };

  const askAi = async (question) => {
    const userQuestion = question.trim();
    if (!userQuestion) return;

    const nextMessages = [...aiMessages, { role: 'user', text: userQuestion }];
    setAiMessages(nextMessages);
    setAiInput('');
    setAiTyping(true);
    try {
      const response = await supportAPI.chat({
        message: userQuestion,
        history: nextMessages.slice(-8),
      });
      const reply = response?.data?.reply?.trim() || generateAiReply(userQuestion);
      setAiMessages((prev) => [...prev, { role: 'ai', text: reply }]);
    } catch (_err) {
      const fallback = generateAiReply(userQuestion);
      setAiMessages((prev) => [...prev, { role: 'ai', text: fallback }]);
    } finally {
      setAiTyping(false);
    }
  };

  const handleAiSubmit = (e) => {
    e.preventDefault();
    askAi(aiInput);
  };

  const focusSupport = () => {
    supportSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validateServiceForm = (formData) => {
    if (!formData.full_name.trim()) {
      return 'Full name is required.';
    }
    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      return 'Enter a valid 10 digit Indian mobile number.';
    }
    return '';
  };

  const handleScheduleAdvice = () => {
    focusSupport();
    setScheduleError('');
    setShowScheduleModal(true);
  };

  const handleWalkInBooking = () => {
    focusSupport();
    setWalkInError('');
    setShowWalkInModal(true);
  };

  const submitScheduleAdvice = async (e) => {
    e.preventDefault();
    const formError = validateServiceForm(scheduleForm);
    if (formError) {
      setScheduleError(formError);
      return;
    }

    setScheduleSubmitting(true);
    setScheduleError('');
    try {
      const response = await supportAPI.scheduleAdvice({
        full_name: scheduleForm.full_name.trim(),
        phone: scheduleForm.phone.trim(),
        preferred_time: scheduleForm.preferred_time.trim(),
        notes: scheduleForm.notes.trim(),
      });
      setMessage(response?.data?.message || 'Advice schedule request submitted.');
      setShowScheduleModal(false);
      setScheduleForm(initialServiceRequestForm);
    } catch (err) {
      setScheduleError(err?.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const submitWalkInBooking = async (e) => {
    e.preventDefault();
    const formError = validateServiceForm(walkInForm);
    if (formError) {
      setWalkInError(formError);
      return;
    }

    setWalkInSubmitting(true);
    setWalkInError('');
    try {
      const response = await supportAPI.walkInBooking({
        full_name: walkInForm.full_name.trim(),
        phone: walkInForm.phone.trim(),
        preferred_time: walkInForm.preferred_time.trim(),
        notes: walkInForm.notes.trim(),
      });
      setMessage(response?.data?.message || 'Walk-in booking request submitted.');
      setShowWalkInModal(false);
      setWalkInForm(initialServiceRequestForm);
    } catch (err) {
      setWalkInError(err?.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setWalkInSubmitting(false);
    }
  };

  return (
    <>
      <ServiceRequestModal
        open={showScheduleModal}
        title="Schedule Personalized Advice"
        subtitle="Share your details and preferred slot. Our pharmacist team will contact you."
        submitLabel="Submit Schedule Request"
        formData={scheduleForm}
        setFormData={setScheduleForm}
        onClose={() => setShowScheduleModal(false)}
        onSubmit={submitScheduleAdvice}
        submitting={scheduleSubmitting}
        error={scheduleError}
      />
      <ServiceRequestModal
        open={showWalkInModal}
        title="Book Walk-In Guidance"
        subtitle="Book a walk-in support slot for preventive care and yearly protection guidance."
        submitLabel="Submit Walk-In Request"
        formData={walkInForm}
        setFormData={setWalkInForm}
        onClose={() => setShowWalkInModal(false)}
        onSubmit={submitWalkInBooking}
        submitting={walkInSubmitting}
        error={walkInError}
      />
      <Header userType="customer" userName={localStorage.getItem('userName') || 'Customer'} />
      <main className="market-shell py-5">
        <section className="rounded-2xl bg-[#0a6a5b] text-white px-4 py-2 text-center text-sm font-bold animate-rise">
          Get Free Delivery over Rs 500
        </section>

        {message && (
          <div className="mt-4">
            <AlertBox type="info">{message}</AlertBox>
          </div>
        )}
        {error && (
          <div className="mt-4">
            <AlertBox type="warning">{error}</AlertBox>
          </div>
        )}

        <section className="mt-4 rounded-3xl border border-[#cfe5df] bg-[#0d5b4f] p-3 md:p-4 text-white animate-rise">
          <div className="flex flex-col xl:flex-row xl:items-center gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black">Pharmico</h1>
              <button
                type="button"
                onClick={() => requestCurrentLocation({ showStatus: true })}
                className="hidden md:flex items-center gap-2 text-sm text-emerald-100 hover:text-white transition"
              >
                <MapPin className="w-4 h-4" />
                {location ? `Deliver to ${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}` : 'Deliver to your location'}
              </button>
            </div>

            <form onSubmit={handleHomeSearch} className="flex-1 grid grid-cols-1 md:grid-cols-[170px_1fr_48px] gap-2">
              <select className="h-11 rounded-full border border-emerald-200 bg-white text-slate-700 px-4 text-sm font-semibold">
                <option>All Categories</option>
                <option>Medicines</option>
                <option>Wellness</option>
                <option>Personal care</option>
              </select>
              <input
                type="text"
                placeholder="Search for medicines, health products..."
                value={homeSearchQuery}
                onChange={(e) => setHomeSearchQuery(e.target.value)}
                className="h-11 rounded-full border border-emerald-200 bg-white text-slate-700 px-4 text-sm"
              />
              <button className="h-11 w-11 rounded-full bg-emerald-200 text-[#0d5b4f] grid place-items-center hover:bg-emerald-100 transition">
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="flex items-center gap-2">
                {[
                { icon: HelpCircle, to: '/orders/1' },
                { icon: Heart, to: '/search' },
                { icon: ShoppingCart, to: '/cart' },
              ].map(({ icon: Icon, to }, idx) => (
                <Link key={idx} to={to} className="w-11 h-11 rounded-full border border-emerald-200 grid place-items-center hover:bg-white/10 transition">
                  <Icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {['Shop by Categories', 'Under 100', 'Best Selling', 'New Arrivals', 'New Offer', 'Personal Care', 'Vitamins & Supplements'].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => navigate(`/search?q=${encodeURIComponent(chip)}`)}
                className="px-4 py-2 rounded-full bg-white text-[#0b4f45] text-xs md:text-sm font-bold"
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        ) : (
          <section className="mt-4 grid grid-cols-1 2xl:grid-cols-3 gap-4">
            <div className="2xl:col-span-2 space-y-4">
              <article className="rounded-3xl bg-gradient-to-r from-[#02463d] via-[#045648] to-[#0b6a57] text-white p-6 md:p-8 overflow-hidden relative animate-rise">
                <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-emerald-300/20 rounded-full blur-2xl" />
                <div className="relative z-10 grid md:grid-cols-2 gap-6 items-center">
                  <div>
                    <p className="text-xs tracking-[0.22em] uppercase text-emerald-100">Healthcare Marketplace</p>
                    <h2 className="text-4xl md:text-5xl font-black leading-tight mt-3">Healthcare Made Simple, Safe, and Accessible</h2>
                    <p className="mt-3 text-emerald-50 max-w-lg">Effective relief, backed by pharmacists. Find essentials, compare prices, and order in minutes.</p>
                    <Link to="/search" className="inline-flex mt-6">
                      <Button size="lg" className="rounded-full">Shop All <ArrowRight className="w-4 h-4 ml-1" /></Button>
                    </Link>
                  </div>

                  <div className="rounded-2xl bg-white/10 border border-white/20 p-5">
                    <h3 className="font-black text-xl">Live Marketplace Stats</h3>
                    <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                      <div className="rounded-xl bg-white/10 p-3">
                        <p className="text-emerald-100">Nearby Stores</p>
                        <p className="font-black text-2xl mt-1">{pharmacies.length}</p>
                      </div>
                      <div className="rounded-xl bg-white/10 p-3">
                        <p className="text-emerald-100">Products</p>
                        <p className="font-black text-2xl mt-1">{medicines.length}</p>
                      </div>
                      <div className="rounded-xl bg-white/10 p-3">
                        <p className="text-emerald-100">Express ETA</p>
                        <p className="font-black text-2xl mt-1">20m</p>
                      </div>
                      <div className="rounded-xl bg-white/10 p-3">
                        <p className="text-emerald-100">Service</p>
                        <p className="font-black text-2xl mt-1">24/7</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {categoryCards.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(cat.key)}`)}
                    className={`rounded-2xl p-4 bg-gradient-to-br ${cat.color} border border-white/70 shadow-sm text-left hover:-translate-y-0.5 transition`}
                  >
                    <span className="text-3xl block">{cat.emoji}</span>
                    <p className="font-extrabold text-[#0f172a] mt-2 text-sm leading-tight">{cat.key}</p>
                  </button>
                ))}
              </section>

              <section className="rounded-3xl bg-white border border-slate-200 p-4 md:p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                  <h3 className="text-3xl font-black text-[#0c4f45]">Featured This Month</h3>
                  <div className="flex gap-2 text-sm items-center">
                    {['Allergy Relief', 'Sun Protection', 'Hydration'].map((tag) => (
                      <span key={tag} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 font-bold">{tag}</span>
                    ))}
                    <Link
                      to="/search"
                      className="px-3 py-1.5 rounded-full bg-[#0a6a5b] text-white font-bold hover:bg-[#095546]"
                    >
                      See All Products
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {featured.map((item) => (
                    <ProductMiniCard key={item.id} medicine={item} onAdd={handleAddToCart} />
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <section ref={supportSectionRef} className="rounded-3xl border border-[#caecd9] bg-gradient-to-r from-[#effbf5] to-[#def5ea] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#0a6a5b] font-black">Support</p>
                    <h4 className="text-xl font-black text-[#114438] mt-1">24/7 AI Customer Care</h4>
                    <p className="text-sm text-[#2e5b50] mt-1">Need help with medicine selection or order tracking?</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#0a6a5b] text-white grid place-items-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm text-[#0f513f] font-bold">
                  <Clock3 className="w-4 h-4" /> Avg response under 2 min
                  <Sparkles className="w-4 h-4" /> Expert assistance
                </div>

                <div className="mt-3 rounded-2xl bg-white/90 border border-[#cfe5df] p-3">
                  <div className="max-h-52 overflow-y-auto pr-1 space-y-2">
                    {aiMessages.map((msg, idx) => (
                      <div
                        key={`${msg.role}-${idx}`}
                        className={`text-xs md:text-sm px-3 py-2 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-[#0a6a5b] text-white ml-6'
                            : 'bg-[#edf8f3] text-[#114438] mr-6'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    {aiTyping && (
                      <div className="text-xs md:text-sm px-3 py-2 rounded-2xl bg-[#edf8f3] text-[#114438] mr-6">
                        AI is typing...
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {supportQuickActions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => askAi(action)}
                        className="text-[11px] md:text-xs font-bold px-2.5 py-1.5 rounded-full bg-[#e6f5ef] text-[#0b5d4f] hover:bg-[#d8eee5]"
                      >
                        {action}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleAiSubmit} className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Ask AI: fever medicine, order tracking, vitamins..."
                      className="flex-1 h-10 rounded-xl border border-[#cfe5df] px-3 text-sm focus:outline-none focus:border-[#0a6a5b]"
                    />
                    <button
                      type="submit"
                      className="h-10 px-4 rounded-xl bg-[#0a6a5b] text-white text-sm font-bold hover:bg-[#095546]"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </section>

              <section className="grid grid-cols-2 gap-3">
                <article className="rounded-2xl p-4 bg-gradient-to-br from-[#e9f8f1] to-[#d5f3e6] border border-[#caecd9]">
                  <p className="text-xs font-bold text-[#0a6a5b]">Pharmacist Consultations</p>
                  <h4 className="font-black mt-2 text-[#114438]">Get Personalized Advice</h4>
                  <Button size="sm" className="mt-3 rounded-full" onClick={handleScheduleAdvice}>Schedule</Button>
                </article>
                <article className="rounded-2xl p-4 bg-gradient-to-br from-[#fff4dd] to-[#ffe8ba] border border-[#f5deb0]">
                  <p className="text-xs font-bold text-[#8a5a00]">Walk-in Welcome</p>
                  <h4 className="font-black mt-2 text-[#6f4700]">Stay Protected All Year</h4>
                  <Button size="sm" variant="outline" className="mt-3 rounded-full" onClick={handleWalkInBooking}>Book</Button>
                </article>
              </section>

              <section className="rounded-3xl bg-white border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-[#0a6a5b] font-extrabold text-sm">
                  <Truck className="w-4 h-4" /> Free Shipping Rs 500+
                  <ShieldCheck className="w-4 h-4 ml-2" /> Doctor Formulated
                </div>
              </section>

              <section className="rounded-3xl bg-white border border-slate-200 p-5">
                <h4 className="font-black text-[#114438]">Trusted Brands</h4>
                <div className="flex flex-wrap gap-2 mt-3">
                  {trustBrands.map((brand) => (
                    <span key={brand} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">{brand}</span>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl bg-[#f8f2e9] border border-[#ecddc8] p-4">
                <div className="grid grid-cols-[110px_1fr] gap-4 items-center">
                  <div className="rounded-2xl bg-white h-28 grid place-items-center">
                    <Pill className="w-10 h-10 text-[#0a6a5b]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-700">Best Seller</p>
                    <h4 className="font-black text-[#173d34] text-lg leading-tight mt-1">
                      {spotlightMedicine?.name || 'Extra Strength Pain Relief Tablets'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-2">
                      {spotlightMedicine
                        ? `${spotlightMedicine.strength || 'General'} • ${spotlightMedicine.unit || 'unit'} • Fast-acting relief support.`
                        : 'Fast-acting formula for pain and inflammation support.'}
                    </p>
                    <Button size="sm" className="mt-3 w-full rounded-full" onClick={handleBestSellerAdd}>
                      {spotlightMedicine ? `Add to Cart - Rs ${Number(spotlightMedicine.price || 0).toFixed(0)}` : 'Explore Pain Relief'}
                    </Button>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-white border border-slate-200 p-4">
                <h3 className="text-3xl font-black text-[#0c4f45]">Our Best Sellers</h3>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bestSellers.slice(0, 4).map((item) => (
                    <ProductMiniCard key={item.id} medicine={item} onAdd={handleAddToCart} />
                  ))}
                </div>
              </section>
            </aside>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};
