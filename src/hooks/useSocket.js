import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNotif } from '../store/notifSlice';

export const useSocket = (userId) => {
  const { push } = useNotif();
  const ref = useRef(null);

  useEffect(() => {
    if (!userId) return;
    ref.current = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token: localStorage.getItem('token') },
      query: { userId }
    });

    ref.current.on('connect', () => {/* connected */});
  const handler = (notif) => push(notif);
  ref.current.on('notification:new', handler);
  ref.current.on('notification', handler);

    return () => { ref.current?.disconnect(); };
  }, [userId]);
};
