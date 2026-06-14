/**
 * CursorGlow.jsx
 * Global soft cursor glow effect that follows the mouse.
 */
import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    const glow = glowRef.current;
    let raf;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x, ty = y;

    const onMouseMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const animate = () => {
      // Smooth lerp towards target
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      if (glow) {
        glow.style.transform = `translate(${x - 200}px, ${y - 200}px)`;
      }
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    raf = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, rgba(14,165,233,0.06) 40%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'none',
        willChange: 'transform',
        filter: 'blur(0px)',
      }}
    />
  );
}
