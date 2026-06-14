/**
 * TiltCard.jsx
 * 3D tilt effect on mouse move inside the card.
 * Usage: <TiltCard className="glass-panel" style={...}>...</TiltCard>
 */
import React, { useRef } from 'react';

export default function TiltCard({ children, className = '', style = {}, maxTilt = 10, glare = true }) {
  const ref = useRef(null);
  const glareRef = useRef(null);

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -maxTilt;
    const rotY = ((x - cx) / cx) * maxTilt;

    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    el.style.transition = 'transform 0.1s ease';

    if (glare && glareRef.current) {
      const angle = Math.atan2(y - cy, x - cx) * (180 / Math.PI);
      glareRef.current.style.opacity = '0.15';
      glareRef.current.style.transform = `rotate(${angle}deg)`;
    }
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
    el.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
    if (glare && glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', willChange: 'transform', ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {glare && (
        <div
          ref={glareRef}
          style={{
            position: 'absolute',
            top: '-50%', left: '-50%',
            width: '200%', height: '200%',
            background: 'linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            zIndex: 10,
          }}
        />
      )}
      {children}
    </div>
  );
}
