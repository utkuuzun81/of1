// Lightweight analytics wrapper (console now; wire to real endpoint later)
export function track(event, payload = {}){
  try{
    // eslint-disable-next-line no-console
    console.log('[analytics]', event, payload);
  }catch{ /* noop */ }
}
