// API Service - Connect React to Flask Backend
import axios from 'axios';

const resolveApiBase = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (typeof window === 'undefined') {
    return 'http://127.0.0.1:8000';
  }

  const { protocol, hostname, port } = window.location;
  // If frontend is served by Flask itself (same host:8000), keep same-origin calls.
  if (port === '8000') {
    return '';
  }

  // In dev/LAN access, call backend on same host over port 8000.
  return `${protocol}//${hostname}:8000`;
};

const API_BASE = resolveApiBase();

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
};

// Pharmacy endpoints
export const pharmacyAPI = {
  nearby: (lat, lng) => api.get('/pharmacies/nearby', { params: { lat, lng } }),
  getPharmacy: (id) => api.get(`/pharmacies/${id}`),
};

// Medicine endpoints
export const medicineAPI = {
  search: (query, pharmacyId = null) =>
    api.get('/medicines/search', { params: { q: query, pharmacy: pharmacyId } }),
  getMedicine: (id) => api.get(`/medicines/${id}`),
};

// Order endpoints
export const orderAPI = {
  create: (orderData) => api.post('/orders/create', orderData),
  getOrder: (id) => api.get(`/orders/${id}`),
  createStripeIntent: (payload) => api.post('/orders/stripe/create-intent', payload),
  confirmStripePayment: (payload) => api.post('/orders/stripe/confirm', payload),
};

// Seller endpoints
export const sellerAPI = {
  register: (sellerData) => api.post('/seller/register', sellerData),
  getDashboard: () => api.get('/seller/dashboard'),
};

// Delivery endpoints
export const deliveryAPI = {
  assign: (deliveryData) => api.post('/delivery/assign', deliveryData),
  updateStatus: (id, status) => api.put(`/delivery/${id}/status`, { status }),
};

// Admin endpoints
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  approveSeller: (sellerId) => api.post('/admin/approve_seller', { seller_id: sellerId }),
  getStoreDashboard: (params) => api.get('/admin/store_dashboard', { params }),
  addMedicine: (payload) => api.post('/admin/add_medicine', payload),
};

// Support / AI endpoints
export const supportAPI = {
  chat: (payload) => api.post('/support/chat', payload),
  scheduleAdvice: (payload) => api.post('/support/schedule-advice', payload),
  walkInBooking: (payload) => api.post('/support/walkin-booking', payload),
};

export default api;
