import { useEffect, useMemo } from 'react';
import { useAuth } from '../store/authSlice';
import { me } from '../api/authApi';

export const useAuthGuard = () => {
  const { user, setSession, clearSession } = useAuth();

  useEffect(() => {
    // Her sayfa yüklemede server'dan /me çağır ve store'u tazele (stale localStorage yerine)
    const token = localStorage.getItem('token');
    if (!token) {
      clearSession();
      return;
    }
    me()
      .then((res) => setSession({ user: res.data, token }))
      .catch(() => clearSession());
  }, []);

  const role = user?.role || null;
  const isApproved = user?.status === 'approved';

  return { user, role, isApproved };
};
