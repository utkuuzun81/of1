import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Container, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PendingRoundedIcon from '@mui/icons-material/PendingRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import { me } from '../../api/authApi';
import api from '../../api/client';
import { useNavigate } from 'react-router-dom';

// Tiny confetti without deps
function useConfetti() {
  const canvasRef = useRef(null);
  const [boom, setBoom] = useState(false);
  useEffect(() => {
    if (!boom || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let rafId;
    const W = (canvas.width = window.innerWidth);
    const H = (canvas.height = 300);
    const pieces = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * W,
      y: Math.random() * -H,
      r: 4 + Math.random() * 6,
      c: `hsl(${Math.random() * 360},90%,60%)`,
      v: 2 + Math.random() * 3,
      a: Math.random() * Math.PI
    }));
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pieces.forEach(p => {
        p.y += p.v;
        p.x += Math.sin(p.a += 0.05);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      if (pieces[0].y < H + 20) rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [boom]);
  return { canvasRef, setBoom };
}

export default function PendingApproval() {
  const nav = useNavigate();
  const [seconds, setSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const { canvasRef, setBoom } = useConfetti();
  const [delayMs, setDelayMs] = useState(60000);

  const tips = useMemo(
    () => [
      'Belgeleriniz güvenle inceleniyor…',
      'İpucu: Profil ayarlarından tema ve dil seçebilirsiniz.',
      'Yeni kampanyalar için bildirimleri açık tutun.',
      'Sepetinize ürün eklemeyi deneyin; fiyatlar anlık güncellenir.',
      'Soru mu var? Sağ üstte iletişim menüsünden yazabilirsiniz.'
    ],
    []
  );

  // Load configurable delay from system settings (public endpoint; no admin rights needed)
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/public/system');
        const ms = res.data?.pendingApprovalRedirectMs ?? res.data?.systemSettings?.pendingApprovalRedirectMs;
        if (typeof ms === 'number' && ms >= 0) setDelayMs(ms);
      } catch {/* ignore and keep default */}
    })();
  }, []);

  // Poll approval status every 5s; redirect when approved
  useEffect(() => {
    let t;
    let mounted = true;
    const poll = async () => {
      try {
        const res = await me();
        const user = res.data;
        if (!mounted) return;
        if (user?.status === 'approved') {
          setBoom(true);
          // Keep the celebration for configured delay before redirecting
          setTimeout(() => nav('/'), delayMs);
          return;
        }
      } catch {
        // ignore
      }
      t = setTimeout(poll, 5000);
    };
    poll();
    return () => { mounted = false; clearTimeout(t); };
  }, [nav, setBoom, delayMs]);

  // Fun timer + tips rotator
  useEffect(() => {
    const int = setInterval(() => setSeconds((s) => s + 1), 1000);
    const tipsInt = setInterval(() => setTipIndex((i) => (i + 1) % tips.length), 4000);
    return () => { clearInterval(int); clearInterval(tipsInt); };
  }, [tips.length]);

  return (
    <Box sx={{ position: 'relative', minHeight: 'calc(100vh - 120px)', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
      <Container>
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center', borderRadius: 4, backdropFilter: 'blur(6px)' }}>
          <Stack spacing={2} alignItems="center">
            <Box sx={{ position: 'relative', width: 120, height: 120 }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: (t) => `radial-gradient(circle at 30% 30%, ${t.palette.primary.light}, ${t.palette.primary.dark})`,
                  filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.25))',
                  display: 'grid',
                  placeItems: 'center',
                  animation: 'float 3s ease-in-out infinite'
                }}
              >
                <PendingRoundedIcon sx={{ fontSize: 64, color: 'white' }} />
              </Box>
              {/* Orbiting dots */}
              <Box sx={{ position: 'absolute', inset: 0 }}>
                {[...Array(12)].map((_, i) => (
                  <Box key={i} sx={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    width: 6, height: 6, borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    transformOrigin: '0 -50px',
                    transform: `rotate(${i * 30}deg) translateY(-50px)`,
                    animation: `orbit 4s linear infinite`,
                    animationDelay: `${i * 0.1}s`
                  }} />
                ))}
              </Box>
            </Box>

            <Typography variant="h5">Onay Süreci Devam Ediyor</Typography>
            <Typography color="text.secondary">Başvurunuz değerlendiriliyor. Onaylandığında anasayfaya yönlendireceğiz.</Typography>

            <Box sx={{ width: '100%', maxWidth: 520, mt: 1 }}>
              <LinearProgress variant="indeterminate" sx={{ height: 8, borderRadius: 999 }} />
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                Geçen süre: {seconds}s · {tips[tipIndex]}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button onClick={() => window.location.reload()} size="small">Yenile</Button>
              <Button onClick={() => (window.location.href = '/contact')} size="small" color="secondary">Destekle İletişim</Button>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
              <CheckCircleRoundedIcon color="success" />
              <Typography variant="body2" color="text.secondary">Belgeler güvenli şekilde kaydedildi</Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <CelebrationRoundedIcon color="warning" />
              <Typography variant="body2" color="text.secondary">Onaylandığında küçük bir kutlama göreceksiniz 🎉</Typography>
            </Stack>
          </Stack>
        </Paper>
      </Container>

      {/* Keyframes */}
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes orbit { from { transform: rotate(0deg) translateY(-50px); } to { transform: rotate(360deg) translateY(-50px); } }
      `}</style>
    </Box>
  );
}
