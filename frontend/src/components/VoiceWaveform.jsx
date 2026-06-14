/**
 * VoiceWaveform.jsx
 * Real-time audio waveform visualizer using Web Audio API AnalyserNode.
 * Pass `stream` (MediaStream) to visualize live microphone input.
 * If no stream, shows a fake animated demo waveform.
 */
import React, { useEffect, useRef } from 'react';

export default function VoiceWaveform({ stream, isActive, color = '#4f46e5', height = 80, label = '' }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const analyserRef = useRef(null);
  const srcRef = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio || 600;
    const H = canvas.height = height * window.devicePixelRatio || 80;
    ctx2d.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    const w = canvas.offsetWidth || 600;
    const h = height;

    let audioCtx, analyser, dataArray;

    const drawFakeWave = (t) => {
      ctx2d.clearRect(0, 0, w, h);
      ctx2d.beginPath();
      const bars = 48;
      const barW = w / bars;
      for (let i = 0; i < bars; i++) {
        const phase = i / bars * Math.PI * 6 + t * 3;
        const amp = isActive
          ? (0.25 + 0.55 * Math.abs(Math.sin(phase) * Math.cos(t + i * 0.3)))
          : 0.08 + 0.05 * Math.abs(Math.sin(phase));
        const barH = amp * h;
        const x = i * barW + barW * 0.15;
        const y = (h - barH) / 2;

        const grad = ctx2d.createLinearGradient(0, y, 0, y + barH);
        grad.addColorStop(0, color + '99');
        grad.addColorStop(0.5, color);
        grad.addColorStop(1, color + '99');
        ctx2d.fillStyle = grad;
        ctx2d.roundRect ? ctx2d.roundRect(x, y, barW * 0.7, barH, 3) : ctx2d.fillRect(x, y, barW * 0.7, barH);
        ctx2d.fill();
      }
    };

    const drawRealWave = () => {
      if (!analyser) return;
      analyser.getByteFrequencyData(dataArray);
      ctx2d.clearRect(0, 0, w, h);
      const barW = w / dataArray.length * 2.5;
      for (let i = 0; i < dataArray.length; i++) {
        const barH = (dataArray[i] / 255) * h;
        const x = i * (barW + 1);
        const y = (h - barH) / 2;
        const grad = ctx2d.createLinearGradient(0, y, 0, y + barH);
        grad.addColorStop(0, color + '88');
        grad.addColorStop(0.5, color);
        grad.addColorStop(1, color + '88');
        ctx2d.fillStyle = grad;
        if (ctx2d.roundRect) ctx2d.roundRect(x, y, Math.max(barW, 2), barH, 2);
        else ctx2d.fillRect(x, y, Math.max(barW, 2), barH);
        ctx2d.fill();
      }
    };

    // Try to connect real stream
    if (stream && isActive) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        srcRef.current = audioCtx.createMediaStreamSource(stream);
        srcRef.current.connect(analyser);
        analyserRef.current = analyser;
        ctxRef.current = audioCtx;
      } catch (e) {
        console.warn('VoiceWaveform: Could not connect stream', e);
      }
    }

    let start = null;
    const loop = (ts) => {
      if (!start) start = ts;
      const t = (ts - start) / 1000;
      if (analyserRef.current && isActive) {
        drawRealWave();
      } else {
        drawFakeWave(t);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      try { audioCtx?.close(); } catch (_) {}
    };
  }, [stream, isActive, color, height]);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: `${height}px`,
          borderRadius: 12,
          background: 'rgba(79,70,229,0.04)',
          border: '1px solid rgba(79,70,229,0.15)',
          display: 'block',
        }}
      />
      {label && (
        <div style={{
          position: 'absolute', bottom: 8, left: 0, right: 0,
          textAlign: 'center', fontSize: '0.75rem', fontWeight: 600,
          color: isActive ? color : '#94a3b8',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          animation: isActive ? 'pulseGlow 1.5s ease-in-out infinite' : 'none',
        }}>
          {isActive ? `● ${label}` : label}
        </div>
      )}
    </div>
  );
}
