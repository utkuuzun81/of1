import { useEffect, useState } from 'react';
import { getHealth } from '../api/healthApi';

export const useHealthcheck = () => {
  const [status, setStatus] = useState('loading');
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    let mounted = true;
    getHealth()
      .then((res) => { if (mounted) { setStatus('ok'); setPayload(res.data); } })
      .catch(() => setStatus('down'));
    return () => { mounted = false; };
  }, []);

  return { status, payload };
};
