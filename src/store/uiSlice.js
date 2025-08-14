import { create } from 'zustand';

export const useUI = create((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen }))
}));
import { create } from 'zustand';

export const useUI = create((set) => ({
  loading: false,
  setLoading: (v) => set({ loading: v }),
  modal: null,
  setModal: (modal) => set({ modal }),
  sidebarOpen: false, // hover ile açılacak
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (v) => set({ sidebarOpen: v })
}));
