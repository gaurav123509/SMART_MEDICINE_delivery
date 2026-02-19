import React from 'react';
import { Header, Footer, Button, Card, MedicineCard } from '../components/common';
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Clock3, BadgePercent, Pill } from 'lucide-react';

const featured = [
  { id: 1, name: 'Paracetamol', strength: '500mg', unit: 'strip', price: 20, available: true, pharmacy_name: 'City Pharmacy', pharmacy_id: 1 },
  { id: 2, name: 'Vitamin C', strength: '500mg', unit: 'bottle', price: 120, available: true, pharmacy_name: 'Wellness Medico', pharmacy_id: 1 },
  { id: 3, name: 'Cetirizine', strength: '10mg', unit: 'strip', price: 28, available: true, pharmacy_name: 'HealthPlus Store', pharmacy_id: 2 },
  { id: 4, name: 'ORS Pack', strength: 'WHO', unit: 'pack', price: 18, available: true, pharmacy_name: 'City Pharmacy', pharmacy_id: 1 },
];

const categories = ['Cold & Flu', 'Diabetes Care', 'Heart Health', 'Vitamins', 'Baby Care', 'Pain Relief', 'Skin Care', 'Nutrition'];

export const LandingPage = () => {
  return (
    <>
      <Header />
      <main className="market-shell py-4">
        <section className="rounded-xl overflow-hidden border border-[#d5d9d9] bg-gradient-to-r from-[#dfefff] via-[#e7f3ff] to-[#f6f9fc]">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-3 p-8 md:p-10">
              <p className="text-[#c7511f] text-xs font-extrabold tracking-wide">MEGA HEALTH SALE</p>
              <h1 className="text-3xl md:text-5xl font-black text-[#131921] mt-2 leading-tight">
                Everyday Medicines At Marketplace Prices
              </h1>
              <p className="text-[#37475a] mt-4 max-w-2xl text-lg">
                Amazon-style shopping experience with verified nearby pharmacy fulfillment and superfast delivery.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link to="/search"><Button size="lg">Shop Now</Button></Link>
                <Link to="/home"><Button variant="outline" size="lg">Explore Deals</Button></Link>
              </div>
            </div>
            <div className="lg:col-span-2 bg-[#131921] text-white p-8 flex flex-col justify-center">
              <p className="text-xs uppercase tracking-[0.15em] text-[#febd69]">Today only</p>
              <p className="text-5xl font-black mt-2">Up to 60% OFF</p>
              <p className="text-sm mt-2 text-slate-300">On OTC & wellness essentials</p>
              <div className="mt-6 space-y-3 text-sm">
                <p className="flex items-center gap-2"><Clock3 className="w-4 h-4 text-[#febd69]" /> Delivery in 20-45 minutes</p>
                <p className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#febd69]" /> 100% verified pharmacies</p>
                <p className="flex items-center gap-2"><BadgePercent className="w-4 h-4 text-[#febd69]" /> Extra savings on bundles</p>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card p-3 mt-4 flex items-center gap-3 overflow-x-auto whitespace-nowrap">
          <p className="font-bold text-sm text-[#37475a] shrink-0">Trending categories:</p>
          {categories.map((cat) => (
            <Link
              key={cat}
              to="/search"
              className="px-3 py-1.5 rounded-md bg-[#f0f2f2] hover:bg-[#e3e6e6] text-sm font-semibold text-[#111]"
            >
              {cat}
            </Link>
          ))}
        </section>

        <section className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { title: 'Top picks under Rs 99', desc: 'OTC essentials and immunity boosters', cta: 'See more' },
            { title: 'Prescription uploads', desc: 'Quick verification and best pharmacy match', cta: 'Upload now' },
            { title: 'Same-day subscriptions', desc: 'Monthly medicine reminders and refills', cta: 'Start plan' },
            { title: 'Express delivery zones', desc: 'Check if your pincode is eligible', cta: 'Check pincode' },
          ].map((x) => (
            <Card key={x.title}>
              <h3 className="text-xl font-black leading-tight">{x.title}</h3>
              <p className="text-sm text-[#565959] mt-2">{x.desc}</p>
              <a href="/search" className="amazon-link text-sm font-bold inline-flex items-center gap-1 mt-6">
                {x.cta} <ChevronRight className="w-4 h-4" />
              </a>
            </Card>
          ))}
        </section>

        <section className="surface-card mt-6 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black">Trending Products</h2>
            <Link to="/search" className="amazon-link text-sm font-bold">See all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((item) => (
              <MedicineCard key={item.id} medicine={item} onAddToCart={() => {}} />
            ))}
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <Pill className="w-6 h-6 text-[#007185]" />
            <h3 className="font-black text-lg mt-3">Member Benefits</h3>
            <p className="text-sm text-[#565959] mt-2">Join MediHub Plus for free express delivery and monthly medicine packs.</p>
          </Card>
          <Card>
            <ShieldCheck className="w-6 h-6 text-[#007185]" />
            <h3 className="font-black text-lg mt-3">Genuine Supply</h3>
            <p className="text-sm text-[#565959] mt-2">Every listed pharmacy is verified with active local medical licenses.</p>
          </Card>
          <Card>
            <Clock3 className="w-6 h-6 text-[#007185]" />
            <h3 className="font-black text-lg mt-3">Live Tracking</h3>
            <p className="text-sm text-[#565959] mt-2">Track rider status in real time from store acceptance to doorstep delivery.</p>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
};
