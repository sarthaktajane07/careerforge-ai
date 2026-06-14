/**
 * FloatingAssistant.jsx
 * A floating AI assistant chatbot widget fixed to the bottom-right.
 * Has preset quick-action responses for demo purposes.
 */
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Minimize2 } from 'lucide-react';

const QUICK_ACTIONS = [
  'Which career is best for me?',
  'How to improve my resume?',
  'Interview tips?',
  'What skills should I learn?',
];

const RESPONSES = {
  'Which career is best for me?': '🤖 Based on current market trends, **Full Stack Development**, **Data Science**, and **Cloud Engineering** are the top 3 high-growth career paths in India right now. Use our Career Assessment module to get a personalized recommendation! 🎯',
  'How to improve my resume?': '📄 Great question! Focus on these 3 things:\n1. Use **action verbs** (built, scaled, optimized)\n2. Add **quantified achievements** (e.g., "Reduced load time by 40%")\n3. Match **ATS keywords** from the job description.\n\nTry our Resume Analyzer for a free ATS score! ✅',
  'Interview tips?': '🎤 Top 3 Interview Tips:\n1. Use the **STAR method** for behavioural questions\n2. Research the company for 20 mins before the interview\n3. Practice out loud — try our **AI Mock Interview** feature!\n\nMost candidates fail because they don\'t practice speaking, not because they lack knowledge. 💪',
  'What skills should I learn?': '🧠 The hottest skills in 2025:\n- **AI/ML** (Python, TensorFlow)\n- **Cloud** (AWS, Azure — get certified!)\n- **Full Stack** (React + Node.js)\n- **Data Analytics** (SQL + Power BI)\n\nUse our Skill Gap Analyzer to see exactly what\'s missing for your target role!',
};

const DEFAULT_RESPONSE = "🤖 I'm your CareerForge AI assistant! Ask me anything about career planning, resume tips, or interview prep. I'm here to help you land your dream job! 🚀";

export default function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'ai', text: "Hi! 👋 I'm your **CareerForge AI** assistant. Ask me anything or pick a quick question below!", ts: Date.now() },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [typing, setTyping] = useState(false);
  const [pulse, setPulse] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Stop pulsing after first open
  useEffect(() => { if (open) setPulse(false); }, [open]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { from: 'user', text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setTyping(true);

    setTimeout(() => {
      const response = RESPONSES[text] || DEFAULT_RESPONSE;
      setMessages(prev => [...prev, { from: 'ai', text: response, ts: Date.now() }]);
      setTyping(false);
    }, 900 + Math.random() * 600);
  };

  const renderText = (text) => {
    // Very basic bold markdown
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Button */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10000,
          boxShadow: '0 8px 30px rgba(79,70,229,0.4)',
          fontSize: '1.6rem',
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          transform: open ? 'scale(0.9) rotate(15deg)' : 'scale(1)',
          animation: pulse ? 'glowPulse 2s ease-in-out infinite' : 'none',
        }}
        title="AI Assistant"
      >
        {open ? '✕' : '🤖'}
        {/* Pulse ring */}
        {pulse && !open && (
          <div style={{
            position: 'absolute', inset: -6,
            borderRadius: '50%',
            border: '2px solid rgba(79,70,229,0.5)',
            animation: 'pulseRing 2s ease-out infinite',
          }} />
        )}
      </div>

      {/* Chat Panel */}
      {open && (
        <div style={s.panel} className="animate-slideInCard">
          {/* Header */}
          <div style={s.header}>
            <div style={s.avatar}>🤖</div>
            <div>
              <div style={s.name}>CareerForge AI</div>
              <div style={s.status}><span style={s.statusDot} /> Online</div>
            </div>
            <button style={s.closeBtn} onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={s.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={{ ...s.msgRow, justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeInUp 0.3s ease both' }}>
                <div style={{
                  ...s.bubble,
                  background: msg.from === 'user'
                    ? 'linear-gradient(135deg, #4f46e5, #0ea5e9)'
                    : 'rgba(255,255,255,0.9)',
                  color: msg.from === 'user' ? '#fff' : '#0f172a',
                  borderRadius: msg.from === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  boxShadow: msg.from === 'user' ? '0 4px 15px rgba(79,70,229,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                }}>
                  {renderText(msg.text)}
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ ...s.msgRow, justifyContent: 'flex-start', animation: 'fadeIn 0.2s ease' }}>
                <div style={{ ...s.bubble, background: 'rgba(255,255,255,0.9)', color: '#475569' }}>
                  <span style={s.typingDots}>
                    <span>●</span><span>●</span><span>●</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Actions */}
          <div style={s.quickActions}>
            {QUICK_ACTIONS.map((q, i) => (
              <button key={i} style={s.quickBtn} onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={s.inputRow}>
            <input
              style={s.input}
              placeholder="Ask me anything..."
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(inputVal)}
            />
            <button style={s.sendBtn} onClick={() => sendMessage(inputVal)}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(0.9); opacity: 0.8; }
          70% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}

const s = {
  panel: {
    position: 'fixed',
    bottom: '6rem',
    right: '2rem',
    width: 360,
    maxHeight: 560,
    background: '#f8fafc',
    borderRadius: 20,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 9999,
    overflow: 'hidden',
    border: '1px solid rgba(0,0,0,0.06)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
    color: '#fff',
  },
  avatar: {
    width: 38, height: 38,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.2rem',
    flexShrink: 0,
  },
  name: { fontWeight: 700, fontSize: '0.95rem' },
  status: { fontSize: '0.75rem', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '4px' },
  statusDot: {
    width: 7, height: 7, borderRadius: '50%',
    background: '#4ade80', display: 'inline-block',
  },
  closeBtn: {
    marginLeft: 'auto', background: 'transparent', border: 'none',
    color: '#fff', cursor: 'pointer', padding: '4px', opacity: 0.8,
    transition: 'opacity 0.2s',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    maxHeight: 260,
  },
  msgRow: {
    display: 'flex',
  },
  bubble: {
    maxWidth: '80%',
    padding: '0.65rem 1rem',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    fontFamily: 'Inter, sans-serif',
  },
  typingDots: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  quickActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    padding: '0.75rem 1rem 0.5rem',
    borderTop: '1px solid rgba(0,0,0,0.06)',
  },
  quickBtn: {
    padding: '0.3rem 0.7rem',
    fontSize: '0.75rem',
    background: 'rgba(79,70,229,0.08)',
    border: '1px solid rgba(79,70,229,0.2)',
    borderRadius: 999,
    color: '#4f46e5',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'Inter, sans-serif',
  },
  inputRow: {
    display: 'flex',
    padding: '0.75rem 1rem',
    gap: '0.5rem',
    borderTop: '1px solid rgba(0,0,0,0.06)',
    background: '#fff',
  },
  input: {
    flex: 1,
    padding: '0.6rem 0.9rem',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: 999,
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    color: '#0f172a',
    background: '#f8fafc',
  },
  sendBtn: {
    width: 38, height: 38,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
    border: 'none',
    color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
    transition: 'transform 0.2s ease',
  },
};
