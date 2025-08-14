import React from 'react';

/**
 * IconClay - simple 3D/clay-looking SVG icons with shading/highlights
 * Variants: 'shield'|'star'|'bolt'|'lock'|'erp'|'email'|'whatsapp'|'cargo'
 * Props: size (px)
 */
export default function IconClay({ variant='star', size=56, className }){
  const id = React.useId();
  const s = size;
  const Shadow = () => (
    <ellipse cx={s*0.5} cy={s*0.82} rx={s*0.28} ry={s*0.12} fill="#000" opacity=".12" />
  );

  const Shield = () => (
    <g>
      <defs>
        <linearGradient id={`g-shield-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#74E6D7"/>
          <stop offset="100%" stopColor="#2EC6A0"/>
        </linearGradient>
        <linearGradient id={`m-metal-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".9"/>
          <stop offset="100%" stopColor="#9aa4b2" stopOpacity=".6"/>
        </linearGradient>
      </defs>
      <Shadow />
      <path d={`M ${s*0.5} ${s*0.16} C ${s*0.34} ${s*0.22}, ${s*0.26} ${s*0.25}, ${s*0.2} ${s*0.28} v ${s*0.26} c 0 ${s*0.18}, ${s*0.16} ${s*0.28}, ${s*0.3} ${s*0.36} c ${s*0.14} -${s*0.08}, ${s*0.3} -${s*0.18}, ${s*0.3} -${s*0.36} v -${s*0.26} c -${s*0.06} -${s*0.03}, -${s*0.14} -${s*0.06}, -${s*0.3} -${s*0.12} Z`} fill={`url(#g-shield-${id})`} stroke="#0b0f14" strokeOpacity=".2" strokeWidth={s*0.02} />
      <path d={`M ${s*0.36} ${s*0.46} l ${s*0.08} ${s*0.09} l ${s*0.16} -${s*0.16}`} fill="none" stroke="url(#m-metal-${id})" strokeWidth={s*0.05} strokeLinecap="round"/>
      <circle cx={s*0.36} cy={s*0.24} r={s*0.2} fill="#fff" opacity=".18"/>
    </g>
  );

  const Star = () => (
    <g>
      <defs>
        <linearGradient id={`g-star-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFC46B"/>
          <stop offset="100%" stopColor="#FF7A59"/>
        </linearGradient>
      </defs>
      <Shadow />
      <path d={`M ${s*0.5} ${s*0.18} L ${s*0.58} ${s*0.38} L ${s*0.8} ${s*0.4} L ${s*0.62} ${s*0.54} L ${s*0.68} ${s*0.76} L ${s*0.5} ${s*0.64} L ${s*0.32} ${s*0.76} L ${s*0.38} ${s*0.54} L ${s*0.2} ${s*0.4} L ${s*0.42} ${s*0.38} Z`} fill={`url(#g-star-${id})`} stroke="#000" strokeOpacity=".12" strokeWidth={s*0.015}/>
      <ellipse cx={s*0.4} cy={s*0.28} rx={s*0.18} ry={s*0.12} fill="#fff" opacity=".18" transform={`rotate(-20 ${s*0.4} ${s*0.28})`} />
    </g>
  );

  const Bolt = () => (
    <g>
      <defs>
        <linearGradient id={`g-bolt-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE36E"/>
          <stop offset="100%" stopColor="#FFAE34"/>
        </linearGradient>
      </defs>
      <Shadow />
      <path d={`M ${s*0.42} ${s*0.16} L ${s*0.26} ${s*0.48} H ${s*0.44} L ${s*0.36} ${s*0.84} L ${s*0.7} ${s*0.44} H ${s*0.5} L ${s*0.58} ${s*0.16} Z`} fill={`url(#g-bolt-${id})`} stroke="#000" strokeOpacity=".12" strokeWidth={s*0.015}/>
      <ellipse cx={s*0.5} cy={s*0.28} rx={s*0.16} ry={s*0.1} fill="#fff" opacity=".18" />
    </g>
  );

  const Lock = () => (
    <g>
      <defs>
        <linearGradient id={`g-lock-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD7D7"/>
          <stop offset="100%" stopColor="#FF8B8B"/>
        </linearGradient>
        <linearGradient id={`g-arc-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#b8c0cc"/>
        </linearGradient>
      </defs>
      <Shadow />
      <rect x={s*0.24} y={s*0.42} width={s*0.52} height={s*0.36} rx={s*0.08} fill={`url(#g-lock-${id})`} stroke="#000" strokeOpacity=".08" strokeWidth={s*0.015} />
      <path d={`M ${s*0.32} ${s*0.42} v -${s*0.08} a ${s*0.18} ${s*0.18} 0 0 1 ${s*0.36} 0 v ${s*0.08}`} fill="none" stroke={`url(#g-arc-${id})`} strokeWidth={s*0.08} />
      <circle cx={s*0.5} cy={s*0.58} r={s*0.06} fill="#0b0f14" opacity=".35" />
    </g>
  );

  const ERP = () => (
    <g>
      <defs>
        <linearGradient id={`g-erp-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6DC7FF"/>
          <stop offset="100%" stopColor="#E6ABFF"/>
        </linearGradient>
      </defs>
      <Shadow />
      <rect x={s*0.18} y={s*0.22} width={s*0.64} height={s*0.44} rx={s*0.1} fill={`url(#g-erp-${id})`} stroke="#000" strokeOpacity=".1" strokeWidth={s*0.015}/>
      {[0,1,2].map(r => (
        [0,1,2].map(c => (
          <rect key={`${r}-${c}`} x={s*(0.22 + c*0.18)} y={s*(0.26 + r*0.12)} width={s*0.12} height={s*0.08} rx={s*0.02} fill="#fff" opacity=".85" />
        ))
      ))}
    </g>
  );

  const Email = () => (
    <g>
      <defs>
        <linearGradient id={`g-mail-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF9BB3"/>
          <stop offset="100%" stopColor="#FF5D7A"/>
        </linearGradient>
      </defs>
      <Shadow />
      <rect x={s*0.18} y={s*0.28} width={s*0.64} height={s*0.36} rx={s*0.08} fill={`url(#g-mail-${id})`} />
      <path d={`M ${s*0.2} ${s*0.3} L ${s*0.5} ${s*0.48} L ${s*0.8} ${s*0.3}`} stroke="#fff" strokeWidth={s*0.04} fill="none" strokeLinecap="round" opacity=".9"/>
    </g>
  );

  const WhatsApp = () => (
    <g>
      <defs>
        <radialGradient id={`g-wa-${id}`} cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#7CF6A3"/>
          <stop offset="100%" stopColor="#0ACF83"/>
        </radialGradient>
      </defs>
      <Shadow />
      <path d={`M ${s*0.5} ${s*0.2} a ${s*0.3} ${s*0.3} 0 1 0 0 ${s*0.6} a ${s*0.3} ${s*0.3} 0 1 0 0 -${s*0.6}`} fill={`url(#g-wa-${id})`} />
      <path d={`M ${s*0.28} ${s*0.68} L ${s*0.36} ${s*0.56}`} stroke="#0A7F55" strokeWidth={s*0.06} opacity=".35" />
      <path d={`M ${s*0.4} ${s*0.38} c ${s*0.02} -${s*0.06}, ${s*0.08} -${s*0.06}, ${s*0.12} -${s*0.04} l ${s*0.06} ${s*0.1} c ${s*0.01} ${s*0.02}, ${s*0.01} ${s*0.03}, 0 ${s*0.05} c -${s*0.02} ${s*0.03}, -${s*0.04} ${s*0.05}, -${s*0.06} ${s*0.08} c ${s*0.1} ${s*0.18}, ${s*0.26} ${s*0.28}, ${s*0.38} ${s*0.34} c ${s*0.04} -${s*0.03}, ${s*0.08} -${s*0.05}, ${s*0.12} -${s*0.06} c ${s*0.02} -${s*0.01}, ${s*0.04} 0, ${s*0.05} ${s*0.01} l ${s*0.08} ${s*0.06} c ${s*0.01} ${s*0.01}, ${s*0.02} ${s*0.03}, ${s*0.01} ${s*0.05} c -${s*0.04} ${s*0.1}, -${s*0.18} ${s*0.14}, -${s*0.28} ${s*0.12} c -${s*0.38} -${s*0.06}, -${s*0.66} -${s*0.34}, -${s*0.78} -${s*0.68} c -${s*0.04} -${s*0.16}, -${s*0.02} -${s*0.32}, ${s*0.08} -${s*0.42} Z`} fill="#fff" opacity=".92"/>
    </g>
  );

  const Cargo = () => (
    <g>
      <defs>
        <linearGradient id={`g-box-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFCC80"/>
          <stop offset="100%" stopColor="#FF8A65"/>
        </linearGradient>
        <linearGradient id={`g-cab-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7EC8FF"/>
          <stop offset="100%" stopColor="#3BA0F3"/>
        </linearGradient>
      </defs>
      <Shadow />
      <rect x={s*0.22} y={s*0.36} width={s*0.44} height={s*0.26} rx={s*0.04} fill={`url(#g-box-${id})`} />
      <rect x={s*0.58} y={s*0.4} width={s*0.18} height={s*0.22} rx={s*0.03} fill={`url(#g-cab-${id})`} />
      <circle cx={s*0.32} cy={s*0.68} r={s*0.06} fill="#1f2937"/>
      <circle cx={s*0.62} cy={s*0.68} r={s*0.06} fill="#1f2937"/>
    </g>
  );

  const map = {
    shield: <Shield />,
    star: <Star />,
    bolt: <Bolt />,
    lock: <Lock />,
    erp: <ERP />,
    email: <Email />,
    whatsapp: <WhatsApp />,
    cargo: <Cargo />,
  };

  return (
    <svg className={className} width={s} height={s} viewBox={`0 0 ${s} ${s}`} role="img" aria-hidden="true">
      {map[variant] || <Star />}
    </svg>
  );
}
