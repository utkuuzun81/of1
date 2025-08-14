import { create } from 'zustand';

// Basit hesaplama: sipariş adedine göre seviye (0 siparişte seviye 0)
const calcLevel = (orderCount=0) => {
  if (orderCount === 0) return 0;
  if (orderCount >= 500) return 5;
  if (orderCount >= 250) return 4;
  if (orderCount >= 50) return 3;
  if (orderCount >= 10) return 2;
  return 1; // 1..9
};
// Not used for credit anymore (credit comes from backend summary)
const creditsByLevel = { 0: 0, 1: 5000, 2: 50000, 3: 250000, 4: 500000, 5: 1000000 };

export const useLoyalty = create((set) => ({
  orderCount: 0,
  level: 0,
  credit: 0,
  progressPct: 0,
  // Geçmiş: backend'den gelir; localStorage'a yazmayız (kullanıcılar arası sızıntıyı önlemek için)
  transactions: [],
  setTransactions: (list=[]) => set(() => ({ transactions: Array.isArray(list) ? list : [] })),
  setCredit: (val) => set(() => ({ credit: Number(val)||0 })),
  setOrderCount: (n) => set((s) => {
    const level = calcLevel(n);
    let progressPct = 0;
  // level ilerleme (örnek: 1->2 için 10 sipariş)
  if (level === 0) progressPct = 0; // ilk sipariş öncesi
  else if (level === 1) progressPct = ((n-1)/9)*100; // 1..9 -> 2. seviye eşiği 10
  else if (level === 2) progressPct = ((n-10)/40)*100; // 10->50
    else if (level === 3) progressPct = ((n-50)/200)*100; // 50->250
    else if (level === 4) progressPct = ((n-250)/250)*100; // 250->500
    else progressPct = 100;
    // yalnızca orderCount/level/progress güncelle; credit backend'den setCredit ile gelir
    return { orderCount: n, level, progressPct: Math.max(0, Math.min(100, progressPct)) };
  }),
}));
