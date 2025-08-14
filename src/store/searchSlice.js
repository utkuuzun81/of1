import { create } from 'zustand';

export const useSearch = create((set) => ({
  query: '',
  results: [],
  setQuery: (q) => set({ query: q }),
  setResults: (r) => set({ results: r }),
  clear: () => set({ query: '', results: [] }),
}));
