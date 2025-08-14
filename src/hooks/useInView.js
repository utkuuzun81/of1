import { useEffect, useRef, useState } from 'react';

// Observe element visibility in viewport
export default function useInView(options = { root: null, rootMargin: '0px', threshold: 0.2 }){
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const ob = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
      else if ((options.once ?? true) === false) setInView(false);
    }, options);
    ob.observe(el);
    return () => ob.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.rootMargin, options.threshold]);

  return [ref, inView];
}
