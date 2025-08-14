import { create } from 'zustand';

const persisted = JSON.parse(localStorage.getItem('cart') || '[]');
const persistedMeta = JSON.parse(localStorage.getItem('cart_meta') || '{}');

export const useCart = create((set, get) => ({
  items: persisted,
  coupon: persistedMeta.coupon || null,
  loyaltyUse: persistedMeta.loyaltyUse || 0,

  add: (product, quantity=1) => {
    const exists = get().items.find((i) => i.product.id === product.id);
    let items;
    if (exists) {
      items = get().items.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
    } else {
      items = [...get().items, { product, quantity }];
    }
    localStorage.setItem('cart', JSON.stringify(items));
    set({ items });
  },
  updateQty: (productId, quantity) => {
    const items = get().items.map((i) => i.product.id === productId ? { ...i, quantity: Math.max(1, quantity) } : i);
    localStorage.setItem('cart', JSON.stringify(items));
    set({ items });
  },
  remove: (productId) => {
    const items = get().items.filter((i) => i.product.id !== productId);
    localStorage.setItem('cart', JSON.stringify(items));
    set({ items });
  },
  clear: () => { localStorage.removeItem('cart'); localStorage.removeItem('cart_meta'); set({ items: [], coupon:null, loyaltyUse:0 }); },

  applyCoupon: (coupon) => {
    const meta = { ...JSON.parse(localStorage.getItem('cart_meta')||'{}'), coupon };
    localStorage.setItem('cart_meta', JSON.stringify(meta));
    set({ coupon });
  },
  removeCoupon: () => {
    const meta = { ...JSON.parse(localStorage.getItem('cart_meta')||'{}') };
    delete meta.coupon; localStorage.setItem('cart_meta', JSON.stringify(meta));
    set({ coupon:null });
  },
  setLoyaltyUse: (tl) => {
    const meta = { ...JSON.parse(localStorage.getItem('cart_meta')||'{}'), loyaltyUse: tl };
    localStorage.setItem('cart_meta', JSON.stringify(meta));
    set({ loyaltyUse: Number(tl)||0 });
  },
}));
