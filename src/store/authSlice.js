import { create } from 'zustand';

export const useAuth = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),

  setSession: ({ user, token }) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    if (token) localStorage.setItem('token', token);
    set({ user, token });
  },
  setUser: (user) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    set((s) => ({ user, token: s.token }));
  },
  clearSession: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
