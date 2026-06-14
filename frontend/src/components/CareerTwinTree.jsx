/**
 * CareerTwinTree.jsx
 * Animated SVG branching tree showing 3 career path scenarios.
 * Lines draw themselves using stroke-dashoffset animation on mount.
 */
import React, { useEffect, useRef, useState } from 'react';

const PATHS = [
  {
    id: 'current',
    label: 'Current Path',
    role: 'Junior Developer',
    salary: '₹5 LPA',
    timeline: '0–1 year',
    color: '#94a3b8',
    steps: ['Learn Basics', 'First Job', 'Junior Developer'],
    icon: '📍',
  },
  {
    id: 'recommended',
    label: 'Recommended Path',
    role: 'Full Stack Engineer',
    salary: '₹12 LPA',
    timeline: '1–3 years',
    color: '#4f46e5',
    steps: ['Learn React + Node', 'Build Projects', 'AWS Certified', 'Full Stack Engineer'],
    icon: '⭐',
    highlight: true,
  },
  {
    id: 'best',
    label: 'Best Possible Path',
    role: 'AI / Cloud Architect',
    salary: '₹30 LPA',
    timeline: '3–5 years',
    color: '#0ea5e9',
    steps: ['DSA + System Design', 'Cloud Certifications', 'AI/ML Specialization', 'Lead Roles', 'AI Architect'],
    icon: '🚀',
  },
];

function AnimatedNode({ x, y, color, label, delay, emoji }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      <circle cx={x} cy={y} r={18} fill={color} opacity={0.15} />
      <circle cx={x} cy={y} r={10} fill={color} />
      <text x={x} y={y + 32} textAnchor="middle" fontSize="11" fill="#475569" fontFamily="Inter, sans-serif" fontWeight="600">
        {label}
      </text>
      {emoji && (
        <text x={x} y={y + 5} textAnchor="middle" fontSize="10" fontFamily="sans-serif">
          {emoji}
        </text>
      )}
    </g>
  );
}

function AnimatedPath({ d, color, delay, duration = 800 }) {
  const pathRef = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => {
      if (pathRef.current) {
        const len = pathRef.current.getTotalLength();
        pathRef.current.style.strokeDasharray = len;
        pathRef.current.style.strokeDashoffset = len;
        pathRef.current.style.transition = `stroke-dashoffset ${duration}ms ease`;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (pathRef.current) pathRef.current.style.strokeDashoffset = '0';
          });
        });
      }
    }, delay);
    return () => clearTimeout(t);
  }, [delay, duration]);

  return (
    <path
      ref={pathRef}
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeDasharray="1000"
      strokeDashoffset="1000"
      opacity={0.6}
    />
  );
}

export default function CareerTwinTree({ report }) {
  const SVG_W = 760;
  const SVG_H = 420;
  const centerX = SVG_W / 2;
  const rootY = 50;
  const branchY = 130;
  const cols = [130, 380, 630];

  // Steps per path
  const maxSteps = Math.max(...PATHS.map(p => p.steps.length));
  const stepSpacing = (SVG_H - branchY - 60) / maxSteps;

  return (
    <div style={tw.wrap}>
      <div style={tw.header}>
        <div className="section-label">Career Twin AI — Branching Scenarios</div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Goal: <strong>{report?.careerGoal || 'Software Engineer'}</strong> — See your 3 possible futures
        </p>
      </div>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ maxHeight: SVG_H }}>
        <defs>
          {PATHS.map(p => (
            <radialGradient key={p.id} id={`grad-${p.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={p.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={p.color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* Root "You" node */}
        <AnimatedNode x={centerX} y={rootY} color="#4f46e5" label="You" delay={0} emoji="🧑" />

        {/* Branch lines from root */}
        {cols.map((col, i) => (
          <AnimatedPath
            key={i}
            d={`M ${centerX} ${rootY + 12} C ${centerX} ${(rootY + branchY) / 2} ${col} ${(rootY + branchY) / 2} ${col} ${branchY - 12}`}
            color={PATHS[i].color}
            delay={300 + i * 100}
            duration={600}
          />
        ))}

        {/* Each path column */}
        {PATHS.map((path, pi) => {
          const cx = cols[pi];
          return (
            <g key={path.id}>
              {/* Path label box */}
              <g style={{ animation: `fadeInUp 0.5s ease ${0.5 + pi * 0.15}s both` }}>
                <rect x={cx - 68} y={branchY - 14} width={136} height={28} rx={14}
                  fill={path.highlight ? path.color : 'none'}
                  stroke={path.color} strokeWidth={path.highlight ? 0 : 1.5}
                  opacity={path.highlight ? 1 : 0.6}
                />
                <text x={cx} y={branchY + 5} textAnchor="middle" fontSize="11" fontFamily="Inter, sans-serif"
                  fill={path.highlight ? '#fff' : path.color} fontWeight="700">
                  {path.icon} {path.label}
                </text>
              </g>

              {/* Steps with connecting lines */}
              {path.steps.map((step, si) => {
                const nodeY = branchY + 55 + si * stepSpacing;
                const prevY = si === 0 ? branchY + 14 : branchY + 55 + (si - 1) * stepSpacing + 10;
                const delay = 700 + pi * 150 + si * 200;
                return (
                  <g key={si}>
                    <AnimatedPath
                      d={`M ${cx} ${prevY} L ${cx} ${nodeY - 10}`}
                      color={path.color}
                      delay={delay - 100}
                      duration={300}
                    />
                    <AnimatedNode
                      x={cx} y={nodeY}
                      color={path.color}
                      label={step}
                      delay={delay}
                      emoji={si === path.steps.length - 1 ? ['🏅','🌟','🏆'][pi] : null}
                    />
                  </g>
                );
              })}

              {/* Salary badge */}
              <g style={{ animation: `fadeInScale 0.5s ease ${1.5 + pi * 0.2}s both`, opacity: 0, animationFillMode: 'both' }}>
                <rect
                  x={cx - 50} y={SVG_H - 52} width={100} height={42} rx={10}
                  fill={path.color} opacity={path.highlight ? 1 : 0.12}
                  stroke={path.color} strokeWidth={path.highlight ? 0 : 1.5}
                />
                <text x={cx} y={SVG_H - 35} textAnchor="middle" fontSize="14" fontFamily="Outfit, sans-serif"
                  fill={path.highlight ? '#fff' : path.color} fontWeight="900">
                  {path.salary}
                </text>
                <text x={cx} y={SVG_H - 18} textAnchor="middle" fontSize="10" fontFamily="Inter, sans-serif"
                  fill={path.highlight ? 'rgba(255,255,255,0.8)' : '#94a3b8'}>
                  {path.timeline}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Scenario detail cards */}
      <div style={tw.cards}>
        {PATHS.map((path, i) => (
          <div key={path.id} style={{
            ...tw.card,
            borderColor: path.highlight ? path.color : 'rgba(0,0,0,0.08)',
            boxShadow: path.highlight ? `0 8px 30px ${path.color}22` : '0 2px 8px rgba(0,0,0,0.04)',
            animation: `slideInCard 0.6s ease ${0.3 + i * 0.15}s both`,
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{path.icon}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: path.color, marginBottom: '0.25rem' }}>
              {path.label}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.15rem' }}>{path.role}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: path.color }}>
              {report ? (i === 0 ? report.scenarioA?.salary : i === 1 ? report.scenarioB?.salary : report.scenarioC?.salary) : path.salary}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>{path.timeline}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const tw = {
  wrap: { padding: '1.5rem 0' },
  header: { marginBottom: '1.5rem' },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  card: {
    padding: '1.5rem',
    background: '#fff',
    borderRadius: 16,
    border: '1.5px solid',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
    cursor: 'default',
  },
};
