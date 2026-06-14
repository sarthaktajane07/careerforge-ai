/**
 * AuroraBackground.jsx
 * Fullscreen animated aurora / glassmorphism background.
 * Place this at the root level — renders behind everything.
 */
import React, { useEffect, useRef } from 'react';

export default function AuroraBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Blobs config
    const blobs = [
      { x: width * 0.2,  y: height * 0.3, r: 350, dx: 0.3, dy: 0.2, color: 'rgba(79,70,229,0.12)'  },
      { x: width * 0.7,  y: height * 0.6, r: 280, dx: -0.2, dy: 0.3, color: 'rgba(14,165,233,0.1)'  },
      { x: width * 0.5,  y: height * 0.1, r: 260, dx: 0.15, dy: -0.2, color: 'rgba(139,92,246,0.09)' },
      { x: width * 0.85, y: height * 0.2, r: 200, dx: -0.25, dy: 0.15, color: 'rgba(6,182,212,0.08)'  },
    ];

    let raf;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      blobs.forEach(blob => {
        // Bounce off edges
        if (blob.x < blob.r || blob.x > width - blob.r)  blob.dx *= -1;
        if (blob.y < blob.r || blob.y > height - blob.r) blob.dy *= -1;
        blob.x += blob.dx;
        blob.y += blob.dy;

        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      raf = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 1,
      }}
    />
  );
}
