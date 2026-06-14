/**
 * MagneticButton.jsx
 * Wraps children in a div that creates a subtle magnetic pull effect on hover.
 * Works without framer-motion – uses vanilla JS transforms.
 */
import React, { useRef } from 'react';

export default function MagneticButton({ children, strength = 0.3, className = '', style = {}, onClick }) {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    el.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'translate(0px, 0px) scale(1)';
    el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
  };

  const handleMouseEnter = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 0.15s ease';
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ display: 'inline-block', transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)', ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
