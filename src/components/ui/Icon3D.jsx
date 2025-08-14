import React from 'react';

/**
 * Icon3D - lightweight 3D-looking SVG icon with gradients/shadows
 * Props: variant ('bolt'|'loyalty'|'shield'|'integration'|'lock'|'faq'|'arrow'|'spark'|'erp'|'email'|'whatsapp'|'cargo'), size
 */
export default function Icon3D({ variant='spark', size=18 }){
  const id = React.useId();
  const s = size;
  const common = (
    <defs>
      <linearGradient id={`g1-${id}`} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#a78bfa"/>
        <stop offset="100%" stopColor="#6ee7b7"/>
      </linearGradient>
      <linearGradient id={`g2-${id}`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity=".7"/>
        <stop offset="100%" stopColor="#000000" stopOpacity=".15"/>
      </linearGradient>
      <filter id={`ds-${id}`} x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
      </filter>
    </defs>
  );
  const base = <rect x="1" y="1" rx={s*0.18} ry={s*0.18} width={s-2} height={s-2} fill={`url(#g1-${id})`} stroke="rgba(0,0,0,.2)" filter={`url(#ds-${id})`}/>;
  const gloss = <rect x="1" y="1" rx={s*0.18} ry={s*0.18} width={s-2} height={(s-2)*0.55} fill={`url(#g2-${id})`} />;

  const glyph = (()=>{
    switch(variant){
      case 'bolt': return <path d="M9 2 L4 11 H8 L7 16 L12 7 H8 Z" fill="#0b0f14" opacity=".9"/>;
      case 'shield': return <path d="M9 2 C6 3 5 3.5 4 4 V9 C4 12 6 14 9 16 C12 14 14 12 14 9 V4 C13 3.5 12 3 9 2 Z" fill="#0b0f14" opacity=".9"/>;
      case 'lock': return <><rect x="4" y="8" width="10" height="6" rx="2" fill="#0b0f14" opacity=".9"/><path d="M6 8 V6 a3 3 0 0 1 6 0 v2" stroke="#0b0f14" strokeWidth="2" fill="none" opacity=".9"/></>;
      case 'integration': return <path d="M5 5 h4 v4 H5 Z M9 9 h4 v4 H9 Z M9 5 h4 v4 H9 Z M5 9 h4 v4 H5 Z" fill="#0b0f14" opacity=".9"/>;
      case 'faq': return <path d="M8.5 6 a2.5 2.5 0 1 1 0 5 v1 h1 v-1 a1.5 1.5 0 1 0 -1.5 -1.5 h-1 A2.5 2.5 0 1 1 9.5 6 Z M9 14 a1 1 0 1 0 0 2 a1 1 0 1 0 0 -2 Z" fill="#0b0f14" opacity=".9"/>;
      case 'arrow': return <path d="M5 8 h6 l-2 -2 v2 h-4 v2 h4 v2 l2 -2 h-6 Z" fill="#0b0f14" opacity=".9"/>;
      case 'spark': return <path d="M9 2 L10.5 7 L15 9 L10.5 11 L9 16 L7.5 11 L3 9 L7.5 7 Z" fill="#0b0f14" opacity=".9"/>;
  case 'erp': return <path d="M4.5 5.5 h3 v3 h-3 Z M8.5 5.5 h3 v3 h-3 Z M4.5 9.5 h3 v3 h-3 Z M8.5 9.5 h3 v3 h-3 Z" fill="#0b0f14" opacity=".9"/>;
  case 'email': return <><rect x="4" y="6" width="10" height="8" rx="2" fill="#0b0f14" opacity=".9"/><path d="M4.5 6.5 L9 10 L13.5 6.5" stroke="#fff" strokeOpacity=".6" strokeWidth="1" fill="none"/></>;
  case 'whatsapp': return <path d="M9 3.5 a5.5 5.5 0 1 0 2.2 10.5 L13.5 15 l-.8-2 a5.3 5.3 0 0 0 1.8-4.0 A5.5 5.5 0 0 0 9 3.5 Z m-2 3.8 c.3-.6.8-.6 1.2-.5 l.6 1 c.1.2.1.3 0 .5 -.2.3-.4.5-.6.8 .5.9 1.3 1.6 2.2 2 .3-.2.6-.4.9-.5 .2-.1.4 0 .5.1 l.8.6 c.1.1.2.3.1.5 -.3.8-1.3 1.1-2.1 1 -1.9-.3-3.4-1.7-4-3.4 -.2-.8-.1-1.6.4-2.1 Z" fill="#0b0f14" opacity=".9"/>;
  case 'cargo': return <path d="M4 10 h9 v3 h-1 a1 1 0 0 1 -2 0 H7 a1 1 0 0 1 -2 0 H4 Z M5 9 h4 V7 H5 Z M9 7 h4 v3 H9 Z" fill="#0b0f14" opacity=".9"/>;
      case 'loyalty': default: return <path d="M9 3 L11 7 L15 8 L12 11 L12.5 15 L9 13 L5.5 15 L6 11 L3 8 L7 7 Z" fill="#0b0f14" opacity=".9"/>;
    }
  })();

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} role="img" aria-hidden="true" style={{ verticalAlign:'-3px' }}>
      {common}
      {base}
      {gloss}
      {glyph}
    </svg>
  );
}
