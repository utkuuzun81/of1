import React, { Suspense, useState, lazy } from "react";
const InteractiveKeypad = lazy(() => import("../../components/interactive/InteractiveKeypad"));

export default function KeypadDemo(){
  const [last, setLast] = useState([]);
  return (
    <div style={{ background:"#0f1b2b", minHeight:"100vh", color:"#e5e7eb", padding:"40px 0" }}>
      <h2 style={{ textAlign:"center", marginBottom: 8 }}>Etkileşimli Keypad + Kayıt + SFX</h2>
      <p style={{ textAlign:"center", opacity:.8, marginBottom: 24 }}>
        Klavyeden <b>O</b> / <b>G</b> / <b>C</b> veya butonlara tıklayın.
      </p>
      <Suspense fallback={<div style={{ height: 320 }} />}> 
        <InteractiveKeypad onRecord={setLast} />
      </Suspense>
      <p style={{ textAlign:"center", opacity:.7 }}>Son dizi: {last.join(" ")}</p>
    </div>
  );
}
