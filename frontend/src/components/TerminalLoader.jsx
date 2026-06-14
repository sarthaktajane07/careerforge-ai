/**
 * TerminalLoader.jsx
 * Animated terminal-style progress bar used instead of spinners.
 * Props:
 *   label   – text shown above bar e.g. "Analyzing Resume..."
 *   steps   – number of filled blocks (max 12)
 */
import React, { useState, useEffect } from 'react';

export default function TerminalLoader({ label = 'Processing...', durationMs = 2400 }) {
  const TOTAL = 12;
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    setFilled(0);
    const interval = durationMs / TOTAL;
    const timer = setInterval(() => {
      setFilled(prev => {
        if (prev >= TOTAL) { clearInterval(timer); return TOTAL; }
        return prev + 1;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [label, durationMs]);

  const bar = '█'.repeat(filled) + '░'.repeat(TOTAL - filled);
  const pct = Math.round((filled / TOTAL) * 100);

  return (
    <div style={s.wrap}>
      <div style={s.terminal}>
        {/* Terminal header dots */}
        <div style={s.header}>
          <span style={{ ...s.dot, background: '#ef4444' }} />
          <span style={{ ...s.dot, background: '#f59e0b' }} />
          <span style={{ ...s.dot, background: '#10b981' }} />
          <span style={s.headerTitle}>careerforge-ai ~ terminal</span>
        </div>
        <div style={s.body}>
          <p style={s.prompt}><span style={s.promptSymbol}>$</span> run analysis --ai</p>
          <p style={s.label}>{label}</p>
          <p style={s.bar}>{bar} <span style={s.pct}>{pct}%</span></p>
          {filled === TOTAL && (
            <p style={{ ...s.label, color: '#10b981', marginTop: '0.5rem', animation: 'fadeIn 0.4s ease' }}>
              ✓ Done — Loading results...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '340px',
    padding: '2rem',
  },
  terminal: {
    width: '100%',
    maxWidth: '420px',
    background: '#0f172a',
    border: '1px solid rgba(79,70,229,0.35)',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 30px rgba(79,70,229,0.15)',
    animation: 'fadeInScale 0.4s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0.75rem 1.25rem',
    background: '#1e293b',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  dot: {
    width: 11, height: 11,
    borderRadius: '50%',
    display: 'inline-block',
  },
  headerTitle: {
    marginLeft: '0.5rem',
    fontSize: '0.75rem',
    color: '#64748b',
    fontFamily: 'monospace',
  },
  body: {
    padding: '1.5rem',
    fontFamily: 'monospace',
  },
  prompt: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginBottom: '1rem',
  },
  promptSymbol: {
    color: '#10b981',
    marginRight: '0.5rem',
  },
  label: {
    fontSize: '0.95rem',
    color: '#e2e8f0',
    marginBottom: '0.75rem',
    fontWeight: 600,
  },
  bar: {
    fontSize: '1rem',
    letterSpacing: '0.05em',
    color: '#6366f1',
    fontWeight: 700,
  },
  pct: {
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
};
