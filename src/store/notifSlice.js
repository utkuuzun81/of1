import { create } from 'zustand';

export const useNotif = create((set) => ({
  list: [],
  unread: 0,
  setList: (list) => set({ list, unread: list.filter((n) => !n.isRead).length }),
  push: (notif) => set((s) => {
    const list = [notif, ...s.list];
    const unread = list.filter((n) => !n.isRead).length;
    return { list, unread };
  })
}));
