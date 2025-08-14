import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * InteractiveKeypad
 * Props:
 * - keys: [{id:'ok', label:'ok', key:'o', hue:14}, ...]
 * - onRecord: (sequence: string[]) => void
 * - muted: boolean
 * - size: 'sm' | 'md' | 'lg'
 */
export default function InteractiveKeypad({
  keys = [
  // Match reference colors: orange "ok", gray "go", near-black "create."
  { id: "ok", label: "ok", key: "o", hue: 24, saturation: 1.8, brightness: 1.06 },
  { id: "go", label: "go", key: "g", hue: 0, saturation: 0.0, brightness: 1.08 },
  { id: "create", label: "create.", key: "c", hue: 0, saturation: 0.0, brightness: 0.52 },
  ],
  onRecord,
  muted = false,
  size = "lg",
  showRecBar = true,
  autoScale = true,
}) {
  const [pressed, setPressed] = useState(null);
  const [seq, setSeq] = useState([]);
  const wrapRef = useRef(null);
  const audioRef = useRef(null);
  const [autoScaleFactor, setAutoScaleFactor] = useState(1);
  const [pressedMap, setPressedMap] = useState({});

  // simple WebAudio click
  useEffect(() => {
    if (muted) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioRef.current = ctx;
    return () => ctx.close();
  }, [muted]);

  const playClick = () => {
    if (muted || !audioRef.current) return;
    const ctx = audioRef.current;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.value = 320; // clicky
    g.gain.value = 0.15;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    // quick decay
    g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.08);
    o.stop(ctx.currentTime + 0.09);
  };

  // keyboard handler
  useEffect(() => {
    const down = (e) => {
      const k = keys.find((x) => x.key.toLowerCase() === e.key.toLowerCase());
      if (!k) return;
      setPressed(k.id);
      setPressedMap((m) => ({ ...m, [k.id]: true }));
      setSeq((s) => {
        const next = [...s, k.label];
        onRecord && onRecord(next);
        return next.slice(-24);
      });
      playClick();
    };
    const up = (e) => {
      const k = keys.find((x) => x.key.toLowerCase() === e.key.toLowerCase());
      if (!k) return;
      setPressedMap((m) => ({ ...m, [k.id]: false }));
      setPressed(null);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [keys, onRecord]);

  // mouse press
  const clickKey = (k) => {
    setPressed(k.id);
    setPressedMap((m) => ({ ...m, [k.id]: true }));
    setSeq((s) => {
      const next = [...s, k.label];
      onRecord && onRecord(next);
      return next.slice(-24);
    });
    playClick();
    setTimeout(() => {
      setPressedMap((m) => ({ ...m, [k.id]: false }));
      setPressed(null);
    }, 140);
  };

  // dynamic scale
  const sizeScale = useMemo(() => (size === "sm" ? 0.8 : size === "md" ? 0.95 : 1), [size]);

  // auto scale to container width
  useEffect(() => {
    if (!autoScale || !wrapRef.current) return;
    const el = wrapRef.current;
    const baseWidth = 820; // design width
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const s = Math.max(0.6, Math.min(1, w / baseWidth));
        setAutoScaleFactor(s);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [autoScale]);

  const scale = autoScale ? autoScaleFactor * sizeScale : sizeScale;

  return (
    <div ref={wrapRef} style={{ padding: "24px" }}>
      <style>{css}</style>

      <div className="keypad" style={{ transform: `scale(${scale})` }}>
        <div className="keypad__base" aria-hidden="true">
          <img src="https://assets.codepen.io/605876/keypad-base.png?format=auto&quality=86" alt="" />
        </div>

        {keys.map((k) => {
          const areaClass =
            k.id === "ok"
              ? "key keypad__single keypad__single--left"
              : k.id === "go"
              ? "key keypad__single"
              : "key keypad__double";
          return (
            <button
              key={k.id}
              className={`${areaClass} ${pressed === k.id ? "key--down" : ""}`}
              style={{
                "--hue": k.hue ?? 0,
                "--saturate": k.saturation ?? 1,
                "--brightness": k.brightness ?? 1,
              }}
              data-pressed={pressedMap[k.id] ? true : undefined}
              aria-label={`${k.label} key (${k.key})`}
              onMouseDown={() => clickKey(k)}
              onTouchStart={() => clickKey(k)}
            >
              <span className="key__mask">
                <span className="key__content">
                  <span className="key__text">{k.label}</span>
                  <img
                    src={k.id === "create"
                      ? "https://assets.codepen.io/605876/keypad-double.png?format=auto&quality=86"
                      : "https://assets.codepen.io/605876/keypad-single.png?format=auto&quality=86"}
                    alt=""
                  />
                </span>
              </span>
              <span className="key__badge">{k.key}</span>
            </button>
          );
        })}
      </div>

      {showRecBar && (
        <div className="recbar" role="status" aria-live="polite">
          <span className="dot" />
          <span className="rec">{seq.join("  ") || "Tuşlara basın…"}</span>
          {!muted ? <span className="hint">SFX açık • Klavyeden O / G / C deneyin</span> : <span className="hint">Sessiz mod</span>}
        </div>
      )}
    </div>
  );
}

const areas = ["left", "right", "double"];

const css = `
.keypad{
  position: relative;
  margin: 12px 0 24px auto;
  width: clamp(280px, 40vw, 520px);
  aspect-ratio: 400 / 310;
  display: block;
  -webkit-tap-highlight-color: transparent;
  transition: translate .26s ease-out, transform .26s ease-out;
  transform-style: preserve-3d;
}
.keypad__base{ position:absolute; bottom:0; width:100%; left:0; }
.keypad__base img{ width:100%; display:block; }

.key{ position:absolute; transform-style: preserve-3d; border:0; background:#0000; padding:0; cursor:pointer; outline:none; }
.key[data-pressed] .key__content, .key:active .key__content{ translate: 0 calc(var(--travel, 20) * 1%); }
.key__mask{ width:100%; height:100%; display:inline-block; }
.key__content{ width:100%; height:100%; display:inline-block; transition: translate .12s ease-out; container-type: inline-size; }
.keypad__single .key__text{ width:52%; height:62%; translate:45% -16%; }
.key__text{ height:46%; width:86%; position:absolute; font-size:12cqi; z-index:21; top:5%; left:0; color:hsl(0 0% 94%); translate:8% 10%; transform: rotateX(36deg) rotateY(45deg) rotateX(-90deg) rotate(0deg); text-align:left; padding:1ch; text-shadow: 0 2px 0 rgba(0,0,0,.35); }

.keypad__single{ position:absolute; width:40.5%; left:54%; bottom:36%; height:46%; clip-path: polygon(0 0,54% 0,89% 24%,100% 70%,54% 100%,46% 100%,0 69%,12% 23%,47% 0%); -webkit-mask: url(https://assets.codepen.io/605876/keypad-single.png?format=auto&quality=86) 50% 50% / 100% 100%; mask: url(https://assets.codepen.io/605876/keypad-single.png?format=auto&quality=86) 50% 50% / 100% 100%; }
.keypad__single.keypad__single--left{ left:29.3%; bottom:54.2%; }
.keypad__double{ position:absolute; width:64%; height:65%; left:6%; bottom:17.85%; clip-path: polygon(34% 0,93% 44%,101% 78%,71% 100%,66% 100%,0 52%,0 44%,7% 17%,30% 0); -webkit-mask: url(https://assets.codepen.io/605876/keypad-double.png?format=auto&quality=86) 50% 50% / 100% 100%; mask: url(https://assets.codepen.io/605876/keypad-double.png?format=auto&quality=86) 50% 50% / 100% 100%; }

.keypad__single img{ top:0; opacity:1; width:96%; position:absolute; left:50%; transform: translate(-50%, 1%); pointer-events:none; }
.keypad__double img{ top:0; opacity:1; width:99%; position:absolute; left:50%; transform: translate(-50%, 1%); pointer-events:none; }
.key img{ filter: hue-rotate(calc(var(--hue, 0) * 1deg)) saturate(var(--saturate, 1)) brightness(var(--brightness, 1)); transition: translate .12s ease-out; }

.key__badge{ display:none; }

@media (max-width: 768px){
  .keypad{ width: clamp(260px, 88vw, 520px); }
}
`;
