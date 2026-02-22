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
  { key: 'Everyday', emoji: '🧰', color: 'from-[#fef3c7] to-[#fde68a]' },
  { key: 'Vitamins', emoji: '💊', color: 'from-[#e0f2fe] to-[#bae6fd]' },
  { key: 'First Aid', emoji: '🩹', color: 'from-[#fee2e2] to-[#fecaca]' },
  { key: 'Personal Care', emoji: '🧴', color: 'from-[#fae8ff] to-[#f5d0fe]' },
  { key: 'Women Health', emoji: '🌸', color: 'from-[#ffe4e6] to-[#fecdd3]' },
  { key: 'Baby Care', emoji: '🍼', color: 'from-[#dcfce7] to-[#bbf7d0]' },
];
const defaultCategoryCard = { emoji: '💊', color: 'from-[#e0f2fe] to-[#bfdbfe]' };
const categoryAliases = {
  Everyday: ['everyday'],
  Vitamins: ['vitamins', 'vitamin'],
  'First Aid': ['firstaid', 'first aid'],
  'Personal Care': ['personalcare', 'personal care'],
  'Women Health': ['womenhealth', 'women health', 'women care'],
  'Baby Care': ['babycare', 'baby care'],
};

const trustBrands = ['Garden of Life', 'vida', 'obit', 'Capsugel', 'CarePro', 'loopa', 'Pharmacy Plus'];
const supportQuickActions = [
  'Track my order',
  'Suggest fever medicines',
  'Best vitamins available',
  'Help for baby care products',
];
const symptomQuickFilters = ['Headache', 'Fever', 'Allergy', 'Digestion', 'Joint Pain', 'Cold & Cough', 'Skin Rash'];
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
    <article className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm hover:shadow-lg transition animate-rise">
      <Link to={`/medicine/${medicine.id}`} className="block">
        <div className="relative rounded-xl bg-gradient-to-br from-cyan-50 to-slate-50 h-40 overflow-hidden flex items-center justify-center">
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

      <p className="text-xs mt-3 font-bold text-cyan-700">Rs {price.toFixed(2)}</p>
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
  const topSellingProducts = useMemo(() => medicines.slice(0, 4), [medicines]);
  const earCareProducts = useMemo(() => medicines.slice(4, 8), [medicines]);
  const eyeCareProducts = useMemo(() => medicines.slice(8, 12), [medicines]);
  const vitaminProducts = useMemo(() => medicines.slice(12, 16), [medicines]);
  const shopCategoryCards = useMemo(() => {
    const normalize = (value) => (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    return categoryCards.map((cat) => {
      const aliases = categoryAliases[cat.key] || [cat.key.toLowerCase()];
      const aliasSet = new Set(aliases.map(normalize));
      const medicine = medicines.find((item) => aliasSet.has(normalize(item?.category))) || null;
      const style = cat || defaultCategoryCard;
      return {
        key: cat.key,
        emoji: style.emoji,
        color: style.color,
        medicine,
      };
    });
  }, [medicines]);
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
    setMessage(result.message || `${medicine.name} added to cart`);
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
      <main className="market-shell medihub-template py-5 md:py-6 space-y-4">
        {message && <AlertBox type="info">{message}</AlertBox>}
        {error && <AlertBox type="warning">{error}</AlertBox>}

        <section className="mesh-hero relative overflow-hidden rounded-[34px] border border-cyan-100/40 p-4 md:p-6 text-white shadow-[0_28px_56px_rgba(8,30,56,0.35)] animate-rise">
          <div className="absolute -left-16 top-4 h-52 w-52 rounded-full bg-cyan-200/20 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="relative grid gap-4 xl:grid-cols-[1.45fr_1fr]">
            <div>
              <div className="section-tag text-white/95 bg-white/15 border-white/30">
                <Sparkles className="h-3.5 w-3.5 mr-1" /> Pulse Mode
              </div>
              <h1 className="mt-4 text-3xl md:text-5xl font-black leading-[1.05] brand-heading">
                Medicine discovery,
                <br />
                reimagined for speed.
              </h1>
              <p className="mt-3 max-w-2xl text-cyan-50/95 text-sm md:text-base">
                Fresh tile-based template: clean data blocks, quick-care actions, and instant pharmacy support in one screen.
              </p>

              <form onSubmit={handleHomeSearch} className="mt-5 grid grid-cols-1 md:grid-cols-[165px_1fr_52px] gap-2">
                <select className="h-11 rounded-full border border-white/35 bg-white/95 text-slate-700 px-4 text-sm font-semibold">
                  <option>All Categories</option>
                  <option>Medicines</option>
                  <option>Wellness</option>
                  <option>Personal care</option>
                </select>
                <input
                  type="text"
                  placeholder="Search by medicine, symptom, care need..."
                  value={homeSearchQuery}
                  onChange={(e) => setHomeSearchQuery(e.target.value)}
                  className="h-11 rounded-full border border-white/35 bg-white/95 text-slate-700 px-4 text-sm"
                />
                <button className="h-11 w-11 rounded-full bg-cyan-100 text-[#0d2f56] grid place-items-center hover:bg-white transition">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>

              <div className="mt-4 flex flex-wrap gap-2">
                {['Rx Upload', 'Need in 30 mins', 'Family Refill', 'Allergy Relief', 'Fever Care', 'Women Care', 'Baby Essentials'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(chip)}`)}
                    className="chip-pill px-4 py-2 text-xs md:text-sm hover:-translate-y-0.5 transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="glass-invert rounded-3xl p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl">Live Care Pulse</h3>
                  <button
                    type="button"
                    onClick={() => requestCurrentLocation({ showStatus: true })}
                    className="inline-flex items-center gap-1 text-xs font-bold text-cyan-100 hover:text-white"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {location ? `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}` : 'Use location'}
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-white/10 p-3"><p className="text-cyan-100">Stores</p><p className="font-black text-2xl mt-1">{pharmacies.length}</p></div>
                  <div className="rounded-xl bg-white/10 p-3"><p className="text-cyan-100">Products</p><p className="font-black text-2xl mt-1">{medicines.length}</p></div>
                  <div className="rounded-xl bg-white/10 p-3"><p className="text-cyan-100">Express ETA</p><p className="font-black text-2xl mt-1">20m</p></div>
                  <div className="rounded-xl bg-white/10 p-3"><p className="text-cyan-100">Support</p><p className="font-black text-2xl mt-1">24/7</p></div>
                </div>
              </div>

              <div className="glass-invert rounded-3xl p-3">
                <div className="grid grid-cols-3 gap-2">
                  {[{ icon: HelpCircle, to: '/orders/1', label: 'Track' }, { icon: Heart, to: '/search', label: 'Wishlist' }, { icon: ShoppingCart, to: '/cart', label: 'Cart' }].map(({ icon: Icon, to, label }) => (
                    <Link key={label} to={to} className="rounded-2xl border border-white/25 bg-white/10 p-3 text-center hover:bg-white/20 transition">
                      <Icon className="h-4 w-4 mx-auto" />
                      <span className="mt-1 block text-xs font-bold">{label}</span>
                    </Link>
                  ))}
                </div>
                <p className="mt-3 text-center text-xs font-semibold text-cyan-100">Emergency basket delivered under 30 mins. Free delivery above Rs 500.</p>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        ) : (
          <section className="space-y-4">
            <section className="neo-panel rounded-[30px] p-5 md:p-7">
              <p className="text-center text-xs uppercase tracking-[0.18em] text-cyan-700 font-extrabold">Storefront</p>
              <h2 className="text-center text-2xl md:text-3xl font-black text-[#0d2f56] mt-2 brand-heading">hii i'm Aiva</h2>
              <form onSubmit={handleAiSubmit} className="mt-4 mx-auto max-w-3xl grid grid-cols-1 md:grid-cols-[1fr_48px] gap-2">
                <input
                  type="text"
                  placeholder="Ask AI: fever medicine, order tracking, vitamins..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="h-11 rounded-full border border-cyan-200 bg-white px-4 text-sm"
                />
                <button type="submit" className="h-11 w-11 rounded-full bg-[#0f766e] text-white grid place-items-center hover:bg-[#0d5f59] transition">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
              <div className="mt-3 mx-auto max-w-3xl rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3 text-sm text-[#0d2f56]">
                {aiTyping ? 'AI is typing...' : (aiMessages[aiMessages.length - 1]?.text || 'Ask anything about medicines.')}
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {trustBrands.slice(0, 6).map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(brand)}`)}
                    className="chip-pill px-3 py-1.5 text-xs"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </section>

            <section className="neo-panel rounded-[30px] p-4 md:p-5">
              <h3 className="text-center text-2xl md:text-3xl font-black text-[#0d2f56] brand-heading">Top Selling Products</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {topSellingProducts.map((item) => (
                  <ProductMiniCard key={item.id} medicine={item} onAdd={handleAddToCart} />
                ))}
              </div>
            </section>

            <section className="neo-panel rounded-[28px] p-4 md:p-5">
              <h3 className="text-center text-2xl font-black text-[#0d2f56] brand-heading">Shop by Categories</h3>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {shopCategoryCards.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(cat.key)}`)}
                    className={`rounded-2xl p-3 bg-gradient-to-br ${cat.color} border border-white/70 shadow-sm text-center hover:-translate-y-0.5 transition`}
                  >
                    {cat.medicine ? (
                      <div className="h-14 w-14 mx-auto rounded-xl bg-white/80 border border-white/70 overflow-hidden">
                        <MedicineImage
                          medicine={cat.medicine}
                          alt={cat.key}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <span className="text-3xl block">{cat.emoji}</span>
                    )}
                    <p className="font-extrabold text-[#0f172a] mt-2 text-sm leading-tight">{cat.key}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="neo-panel rounded-[28px] p-4 md:p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h3 className="text-2xl font-black text-[#0d2f56] brand-heading">Ear Care Products</h3>
                <Link to="/search?q=Ear%20Care" className="chip-pill px-3 py-1.5 text-xs">View All</Link>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {earCareProducts.map((item) => (
                  <ProductMiniCard key={item.id} medicine={item} onAdd={handleAddToCart} />
                ))}
              </div>
            </section>

            <section className="rounded-[24px] overflow-hidden border border-cyan-200 bg-gradient-to-r from-[#14b8a6] via-[#10b2c4] to-[#0ea5e9] px-5 py-6 md:px-8 md:py-8 text-white">
              <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto] items-center gap-4">
                <div className="rounded-2xl bg-white/20 h-24 grid place-items-center">
                  <Pill className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em]">Bulk Buy & Save More</p>
                  <p className="text-3xl font-black mt-1 brand-heading">Get Upto 25% OFF</p>
                </div>
                <Button className="rounded-full bg-white text-[#0d2f56] hover:bg-cyan-50" onClick={() => navigate('/search')}>
                  Shop Now
                </Button>
              </div>
            </section>

            <section className="neo-panel rounded-[28px] p-4 md:p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h3 className="text-2xl font-black text-[#0d2f56] brand-heading">Eye Care Products</h3>
                <Link to="/search?q=Eye%20Care" className="chip-pill px-3 py-1.5 text-xs">View All</Link>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {eyeCareProducts.map((item) => (
                  <ProductMiniCard key={item.id} medicine={item} onAdd={handleAddToCart} />
                ))}
              </div>
            </section>

            <section className="neo-panel rounded-[28px] p-4 md:p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h3 className="text-2xl font-black text-[#0d2f56] brand-heading">Vitamin Tablets & Spray</h3>
                <Link to="/search?q=Vitamins" className="chip-pill px-3 py-1.5 text-xs">View All</Link>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {vitaminProducts.map((item) => (
                  <ProductMiniCard key={item.id} medicine={item} onAdd={handleAddToCart} />
                ))}
              </div>
            </section>

            <section ref={supportSectionRef} className="neo-panel rounded-[28px] p-4 md:p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="section-tag">Support Desk</p>
                  <h4 className="text-2xl font-black text-[#0d2f56] mt-1 brand-heading">Need Help Choosing?</h4>
                </div>
                <div className="flex items-center gap-2 text-[#0f766e] font-extrabold text-sm">
                  <Truck className="w-4 h-4" /> Free Shipping Rs 500+
                  <ShieldCheck className="w-4 h-4 ml-2" /> Doctor Formulated
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {supportQuickActions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => askAi(action)}
                    className="chip-pill px-3 py-1.5 text-xs"
                  >
                    {action}
                  </button>
                ))}
                <Button size="sm" className="rounded-full" onClick={handleScheduleAdvice}>Schedule Advice</Button>
                <Button size="sm" variant="outline" className="rounded-full" onClick={handleWalkInBooking}>Book Walk-In</Button>
                <Button size="sm" variant="outline" className="rounded-full" onClick={handleBestSellerAdd}>
                  {spotlightMedicine ? `Add ${spotlightMedicine.name}` : 'Explore Best Seller'}
                </Button>
              </div>
            </section>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};
