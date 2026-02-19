// Utility functions
export const formatPrice = (price) => `₹${price.toFixed(2)}`;

export const formatDistance = (km) => {
  if (km < 1) return `${(km * 1000).toFixed(0)}m`;
  return `${km.toFixed(1)}km`;
};

export const calculateDeliveryTime = (distance, isExpress = false) => {
  if (isExpress) return '15-20 min';
  const mins = Math.ceil(distance * 3);
  return `${mins}-${mins + 5} min`;
};

export const getDeliveryCharge = (distance, isExpress = false, freeRadius = 2.5) => {
  if (distance <= freeRadius) return { charge: 0, label: 'Free' };
  const charge = Math.max(20, (distance - freeRadius) * 5);
  if (isExpress) {
    return { charge: charge + 30, label: `Express ₹${(charge + 30).toFixed(0)}` };
  }
  return { charge, label: `₹${charge.toFixed(0)}` };
};

export const validatePhoneNumber = (phone) => /^[0-9]{10}$/.test(phone);

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
