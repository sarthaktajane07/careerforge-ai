/**
 * SkillRadarChart.jsx
 * Animated SVG radar/spider chart for skill visualization.
 * Animates from center outward on mount using CSS stroke-dashoffset.
 */
import React, { useEffect, useState } from 'react';

const toRad = deg => (deg * Math.PI) / 180;

function polarToXY(cx, cy, r, angleDeg) {
  const rad = toRad(angleDeg - 90);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function buildPolygon(cx, cy, values, maxR, labels) {
  const n = values.length;
  const step = 360 / n;
  return values.map((val, i) => {
    const r = (val / 100) * maxR;
    return polarToXY(cx, cy, r, step * i);
  });
}

function pointsStr(pts) {
  return pts.map(p => `${p.x},${p.y}`).join(' ');
}

export default function SkillRadarChart({ skills = [], size = 300 }) {
  const [progress, setProgress] = useState(0);
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const levels = [0.25, 0.5, 0.75, 1];

  // Animate progress from 0 to 1
  useEffect(() => {
    setProgress(0);
    let start = null;
    const duration = 1400;
    const frame = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const p = Math.min(elapsed / duration, 1);
      // ease out cubic
      setProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(frame);
    };
    const raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [skills.join(',')]);

  if (!skills.length) return null;

  const n = skills.length;
  const step = 360 / n;

  // Animated values
  const animatedSkills = skills.map(s => ({ ...s, animVal: s.value * progress }));
  const dataPoints = buildPolygon(cx, cy, animatedSkills.map(s => s.animVal), maxR, skills);
  const axisPoints = skills.map((_, i) => polarToXY(cx, cy, maxR * 1.05, step * i));
  const labelPoints = skills.map((_, i) => polarToXY(cx, cy, maxR * 1.28, step * i));

  const colors = {
    polygon: 'rgba(79,70,229,0.18)',
    stroke: '#4f46e5',
    grid: 'rgba(0,0,0,0.06)',
    axis: 'rgba(0,0,0,0.1)',
    label: '#475569',
    dot: '#4f46e5',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid levels */}
        {levels.map((level, li) => {
          const pts = skills.map((_, i) => polarToXY(cx, cy, maxR * level, step * i));
          return (
            <polygon
              key={li}
              points={pointsStr(pts)}
              fill="none"
              stroke={colors.grid}
              strokeWidth={1}
            />
          );
        })}

        {/* Axis lines */}
        {axisPoints.map((pt, i) => (
          <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke={colors.axis} strokeWidth={1} />
        ))}

        {/* Animated data polygon */}
        <polygon
          points={pointsStr(dataPoints)}
          fill={colors.polygon}
          stroke={colors.stroke}
          strokeWidth={2.5}
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 8px rgba(79,70,229,0.3))' }}
        />

        {/* Data dots with glow */}
        {dataPoints.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r={6} fill="rgba(79,70,229,0.15)" />
            <circle cx={pt.x} cy={pt.y} r={3.5} fill={colors.dot} />
          </g>
        ))}

        {/* Labels */}
        {labelPoints.map((pt, i) => (
          <text
            key={i}
            x={pt.x}
            y={pt.y + 4}
            textAnchor="middle"
            fontSize={10}
            fontFamily="Inter, sans-serif"
            fontWeight="600"
            fill={colors.label}
          >
            {skills[i].label}
          </text>
        ))}

        {/* Value labels on dots */}
        {dataPoints.map((pt, i) => (
          <text
            key={`v${i}`}
            x={pt.x}
            y={pt.y - 8}
            textAnchor="middle"
            fontSize={9}
            fontFamily="Inter, sans-serif"
            fontWeight="700"
            fill={colors.stroke}
          >
            {Math.round(animatedSkills[i].animVal)}%
          </text>
        ))}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={3} fill={colors.stroke} opacity={0.4} />
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
        {skills.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#475569' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5' }} />
            {s.label}: <strong style={{ color: '#0f172a' }}>{s.value}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
