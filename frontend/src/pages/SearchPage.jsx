import React, { useState, useMemo, useEffect } from 'react';
import { Header, Footer, Button, MedicineCard, LoadingSpinner, AlertBox, Card } from '../components/common';
import { medicineAPI } from '../services/api';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { addToCart } from '../utils/cart';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const pharmacyId = searchParams.get('pharmacy');

  const loadAllProducts = async () => {
    setLoading(true);
    setSearched(true);
    setError('');
    setMessage('');
    try {
      let response = await medicineAPI.search('', pharmacyId);
      let items = response.data.results || [];

      // If selected pharmacy has no products, fallback to all pharmacies.
      if (pharmacyId && items.length === 0) {
        response = await medicineAPI.search('', null);
        items = response.data.results || [];
        if (items.length > 0) {
          setMessage('No products in selected pharmacy. Showing all products from all pharmacies.');
        }
      }

      setResults(items);
    } catch (error) {
      console.error('Load all failed:', error);
      setResults([]);
      setError('Unable to load products right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (value) => {
    if (!value.trim()) return;
    setLoading(true);
    setSearched(true);
    setError('');
    setMessage('');
    try {
      let response = await medicineAPI.search(value, pharmacyId);
      let items = response.data.results || [];
      if (response.data.fallback_used && items.length > 0) {
        setMessage(`Exact match not found. Showing closest available medicines for "${value}".`);
      }

      // If filtered pharmacy has no matching medicine, fallback to all pharmacies.
      if (pharmacyId && items.length === 0) {
        response = await medicineAPI.search(value, null);
        items = response.data.results || [];
        if (items.length > 0) {
          setMessage(`No match in selected pharmacy. Showing results from all pharmacies for "${value}".`);
        }
      }

      setResults(items);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      setError('Search service unavailable. Please check backend connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    if (q.trim()) {
      performSearch(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('q', query);
    setSearchParams(nextParams);
    await performSearch(query);
  };

  const visibleResults = useMemo(() => {
    let list = [...results];
    if (inStockOnly) {
      list = list.filter((item) => item.available);
    }
    if (priceFilter === 'under_50') {
      list = list.filter((item) => Number(item.price) < 50);
    }
    if (priceFilter === '50_200') {
      list = list.filter((item) => Number(item.price) >= 50 && Number(item.price) <= 200);
    }
    if (priceFilter === 'above_200') {
      list = list.filter((item) => Number(item.price) > 200);
    }
    if (sortBy === 'price_low') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (sortBy === 'price_high') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    }
    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [results, inStockOnly, priceFilter, sortBy]);

  const handleAddToCart = (medicine) => {
    const result = addToCart(medicine);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage(`${medicine.name} added to cart`);
  };

  return (
    <>
      <Header userType="customer" />
      <main className="market-shell py-6">
        <form onSubmit={handleSearch} className="surface-card p-4 mb-5">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search medicines, wellness products, symptoms..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:border-orange-500"
              />
            </div>
            <Button variant="primary" size="md">Search</Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                setQuery('');
                loadAllProducts();
              }}
            >
              All
            </Button>
          </div>
        </form>
        {message && (
          <div className="mb-5">
            <AlertBox type="info">{message}</AlertBox>
          </div>
        )}
        {error && (
          <div className="mb-5">
            <AlertBox type="error">{error}</AlertBox>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <aside className="lg:col-span-1">
            <Card>
              <h3 className="font-extrabold text-lg flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Filters</h3>
              <label className="mt-4 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
                In stock only
              </label>

              <div className="mt-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Price</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { key: 'under_50', label: 'Under Rs 50' },
                    { key: '50_200', label: 'Rs 50 - Rs 200' },
                    { key: 'above_200', label: 'Above Rs 200' },
                  ].map((p) => {
                    const active = priceFilter === p.key;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setPriceFilter(active ? 'all' : p.key)}
                        className={`text-xs rounded-full px-3 py-1.5 font-semibold ${
                          active
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          </aside>

          <section className="lg:col-span-3">
            {!searched ? (
              <Card className="text-center py-12">
                <h2 className="text-2xl font-extrabold text-slate-900">Search Products Like a Marketplace</h2>
                <p className="text-slate-600 mt-2">
                  Type medicine names and compare options from nearby pharmacies.
                  {pharmacyId ? ` Filter active for pharmacy #${pharmacyId}.` : ''}
                </p>
                {pharmacyId && (
                  <button
                    onClick={() => {
                      const nextParams = new URLSearchParams(searchParams);
                      nextParams.delete('pharmacy');
                      setSearchParams(nextParams);
                    }}
                    className="mt-4 text-sm font-bold amazon-link"
                  >
                    Clear pharmacy filter
                  </button>
                )}
              </Card>
            ) : loading ? (
              <LoadingSpinner />
            ) : visibleResults.length > 0 ? (
              <>
                <div className="surface-card p-3 mb-4 flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Showing <span className="font-extrabold text-slate-900">{visibleResults.length}</span> results for <span className="font-bold">"{query}"</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-slate-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-sm border rounded-md px-2 py-1.5 bg-white"
                    >
                      <option value="relevance">Sort: Relevance</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="name">Name</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {visibleResults.map((medicine) => (
                    <MedicineCard key={medicine.id} medicine={medicine} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              </>
            ) : (
              <AlertBox type="info">
                No medicines found for "{query}". Try a different keyword.
              </AlertBox>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};
