import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Compass, ShieldAlert, FileText, HelpCircle, GitMerge, Award, CheckCircle, Sparkles, Zap, Star, TrendingUp, Users, Brain } from 'lucide-react';
import AIHero3D from '../components/AIHero3D.jsx';

/* ── Floating particle dot ── */
const Particle = ({ style }) => (
  <div style={{
    position: 'absolute',
    width: '3px', height: '3px',
    borderRadius: '50%',
    background: 'rgba(124,58,237,0.7)',
    animation: `particleFloat ${style.duration}s linear ${style.delay}s infinite`,
    left: style.left, top: style.top,
    pointerEvents: 'none',
  }} />
);

/* ── Animated counter ── */
const AnimatedNumber = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ── Scroll reveal hook ── */
const useScrollReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

export const LandingPage = ({ onNavigate }) => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const particles = Array.from({ length: 18 }, (_, i) => ({
    left: `${(i * 5.5) % 100}%`,
    top: `${(i * 7.3 + 10) % 100}%`,
    duration: 8 + (i % 6),
    delay: -(i * 1.1),
  }));
  useScrollReveal();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setContactForm({ name: '', email: '', message: '' }); }, 3500);
  };

  const features = [
    { icon: <Compass size={22} />, title: 'Career Assessment AI', desc: 'Discover your perfect career path with AI-powered psychometric analysis and personalized roadmaps.' },
    { icon: <FileText size={22} />, title: 'Resume ATS Auditor', desc: 'Score your resume against real ATS algorithms and get instant keyword optimization suggestions.' },
    { icon: <HelpCircle size={22} />, title: 'AI Mock Interviews', desc: 'Practice with voice & video AI interviews. Get scored on confidence, communication, and accuracy.' },
    { icon: <GitMerge size={22} />, title: 'Skill Gap Mapping', desc: 'Map your skills against any job role and get a week-by-week learning roadmap to close the gap.' },
    { icon: <Brain size={22} />, title: 'Career Twin AI', desc: 'Simulate 3 alternate career futures side-by-side with salary timelines and growth projections.' },
  ];

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {particles.map((p, i) => <Particle key={i} style={p} />)}
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* ── HERO ── */}
      <section style={s.heroSection}>
        <div style={s.heroBg} />
        <div style={s.heroContent}>
          {/* Animated badge */}
          <div className="animate-fadeInUp" style={s.heroBadge}>
            <Sparkles size={13} />
            <span>Innovation Competition 2025 · Flagship Project</span>
          </div>

          <h1 className="animate-fadeInUp delay-200" style={s.heroTitle}>
            Shape Your Future<br />
            <span className="gradient-text">with CareerForge AI</span>
          </h1>

          <p className="animate-fadeInUp delay-300" style={s.heroSubtitle}>
            The world's first AI Career OS — Resume audits, voice mock interviews,
            skill gap maps, and Career Twin simulations. All in one platform.
          </p>

          <div className="animate-fadeInUp delay-400" style={s.heroActions}>
            <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2rem' }} onClick={() => onNavigate('register')}>
              Start For Free <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.9rem 2rem' }} onClick={() => {
              document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Explore Features
            </button>
          </div>

          {/* Floating stat pills */}
          <div className="animate-fadeInUp delay-500" style={s.statPills}>
            {[
              { icon: <Users size={14}/>, val: '12K+', label: 'Students' },
              { icon: <Star size={14}/>, val: '4.9★', label: 'Rating' },
              { icon: <TrendingUp size={14}/>, val: '87%', label: 'Placement Rate' },
            ].map((p, i) => (
              <div key={i} style={s.statPill} className="animate-float" style2={{ animationDelay: `${i * 0.5}s` }}>
                <span style={{ color: 'var(--accent-purple-light)' }}>{p.icon}</span>
                <strong>{p.val}</strong>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Animated 3D AI Brain Hero */}
        <div className="animate-fadeInRight delay-300" style={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'center' }}>
          <AIHero3D height={540} />
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={s.statsBar}>
        {[
          { value: 12000, suffix: '+', label: 'Students Guided' },
          { value: 94, suffix: '%', label: 'Resume Score Boost' },
          { value: 5000, suffix: '+', label: 'Interviews Practiced' },
          { value: 87, suffix: '%', label: 'Placement Rate' },
        ].map((stat, i) => (
          <div key={i} className="reveal" style={{ ...s.statItem, animationDelay: `${i * 0.15}s` }}>
            <div style={s.statValue}><AnimatedNumber target={stat.value} suffix={stat.suffix} /></div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── PROBLEM ── */}
      <section style={s.altSection}>
        <div style={s.sectionInner}>
          <div className="section-label reveal">The Problem We Solve</div>
          <h2 className="reveal" style={s.sectionTitle}>The Career Dilemma We Resolve</h2>
          <p className="reveal" style={s.sectionSubtitle}>Students and job seekers face structural hurdles that hurt outcomes.</p>
          <div style={s.grid3}>
            {[
              { icon: <ShieldAlert size={26}/>, color:'#ef4444', bg:'rgba(239,68,68,0.1)', title:'The Skill Gap Void', text:'Academic syllabus rarely matches corporate tech stacks. Candidates remain unaware of missing certifications or framework competencies.' },
              { icon: <Compass size={26}/>, color:'#f59e0b', bg:'rgba(245,158,11,0.1)', title:'Career Ambiguity', text:'Choosing between Frontend, DevOps, Product, or Data without simulating timelines, salary ranges, and required certifications.' },
              { icon: <Award size={26}/>, color:'var(--accent-purple-light)', bg:'rgba(124,58,237,0.1)', title:'Interview Anxiety', text:'Going into live panels without role-specific practice. Mock training is unavailable or priced out of reach for most students.' },
            ].map((c, i) => (
              <div key={i} className="glass-panel glass-panel-interactive reveal card-glow-purple" style={{ padding:'2rem', animationDelay:`${i*0.15}s` }}>
                <div style={{ width:54, height:54, borderRadius:14, background: c.bg, color: c.color, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.25rem', fontSize:'1.2rem' }}>{c.icon}</div>
                <h3 style={{ fontSize:'1.15rem', fontWeight:700, marginBottom:'0.6rem' }}>{c.title}</h3>
                <p style={{ color:'var(--color-text-secondary)', fontSize:'0.9rem', lineHeight:1.7 }}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features-section" style={s.section}>
        <div style={s.sectionInner}>
          <div className="section-label reveal">Platform Modules</div>
          <h2 className="reveal" style={s.sectionTitle}>Full-Suite Professional Forge</h2>
          <p className="reveal" style={s.sectionSubtitle}>Five integrated AI modules working together to elevate your career.</p>
          <div style={s.featuresLayout}>
            {/* Tab buttons */}
            <div style={s.featureTabs}>
              {features.map((f, i) => (
                <button key={i} onClick={() => setActiveFeature(i)} style={{
                  ...s.featureTab,
                  background: activeFeature === i ? 'rgba(124,58,237,0.15)' : 'transparent',
                  borderColor: activeFeature === i ? 'rgba(124,58,237,0.5)' : 'var(--border-glass)',
                  color: activeFeature === i ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                }}>
                  <span style={{ color: activeFeature===i ? 'var(--accent-purple-light)' : 'var(--color-text-muted)' }}>{f.icon}</span>
                  {f.title}
                </button>
              ))}
            </div>
            {/* Feature detail */}
            <div className="glass-panel animate-fadeInScale" key={activeFeature} style={s.featureDetail}>
              <div style={{ fontSize: '3.5rem', marginBottom:'1rem' }}>
                {['🧭','📄','🎤','🗺️','🤖'][activeFeature]}
              </div>
              <h3 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:'0.75rem' }}>{features[activeFeature].title}</h3>
              <p style={{ color:'var(--color-text-secondary)', fontSize:'1rem', lineHeight:1.8, marginBottom:'1.5rem' }}>{features[activeFeature].desc}</p>
              <button className="btn btn-primary" onClick={() => onNavigate('register')}>
                Try It Free <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={s.altSection}>
        <div style={s.sectionInner}>
          <div className="section-label reveal">Pricing</div>
          <h2 className="reveal" style={s.sectionTitle}>Affordable Plans For Everyone</h2>
          <p className="reveal" style={s.sectionSubtitle}>Simple tiers for students, job seekers, and institutions.</p>
          <div className="pricing-grid">
            {[
              { name:'Starter', price:'₹0', sub:'Best for exploring', color:'var(--color-text-primary)', features:['1 Career Assessment','1 Resume Upload','1 AI Mock Interview','Basic Skill Gap Check'], cta:'Start Free', variant:'btn-secondary' },
              { name:'Pro Seeker', price:'₹499', sub:'For active job seekers', color:'var(--accent-purple-light)', features:['Unlimited Assessments','Unlimited Resume Uploads','Unlimited Mock Interviews','Full Career Twin AI Suite','Weekly Skill Gap Roadmaps'], cta:'Get Started', variant:'btn-primary', popular:true },
              { name:'University', price:'₹4999', sub:'Bulk access for classrooms', color:'var(--accent-cyan)', features:['Up to 200 Student Accounts','Admin Analytics Panel','Class-wide Readiness Index','Institutional Branding'], cta:'Deploy Campus', variant:'btn-secondary' },
            ].map((plan, i) => (
              <div key={i} className={`glass-panel pricing-card reveal ${plan.popular?'popular':''}`} style={{ animationDelay:`${i*0.15}s` }}>
                <div>
                  <h3 style={{ fontSize:'1.4rem', fontWeight:800, color: plan.color, marginBottom:'0.3rem' }}>{plan.name}</h3>
                  <p style={{ color:'var(--color-text-secondary)', fontSize:'0.85rem', marginBottom:'1rem' }}>{plan.sub}</p>
                  <div style={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap:'0.3rem', margin:'1.5rem 0' }}>
                    <span style={{ fontSize:'3rem', fontWeight:900, fontFamily:'var(--font-display)', color: plan.color }}>{plan.price}</span>
                    <span style={{ color:'var(--color-text-muted)' }}>/month</span>
                  </div>
                  <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'0.7rem', margin:'1.5rem 0', fontSize:'0.9rem' }}>
                    {plan.features.map((f, j) => (
                      <li key={j} style={{ display:'flex', alignItems:'center', gap:'0.6rem', color:'var(--color-text-secondary)' }}>
                        <CheckCircle size={14} color="var(--accent-emerald)" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <button className={`btn ${plan.variant}`} style={{ width:'100%' }} onClick={() => onNavigate('register')}>{plan.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div className="section-label reveal">Social Proof</div>
          <h2 className="reveal" style={s.sectionTitle}>Endorsed By Achievers</h2>
          <p className="reveal" style={s.sectionSubtitle}>From students to university deans — real results, real stories.</p>
          <div style={s.grid3}>
            {[
              { text:'"CareerForge boosted our class resume scores from 55% to 80%+. The Career Twin simulations excited students more than any career counselor ever did."', name:'Dr. David Ross', role:'Dean of Engineering, Tech State', initials:'DR', stars:5 },
              { text:'"The Mock Interview module cured my interview anxiety. It gave me feedback on Big-O explanations. I landed a Software Engineer role at Stripe!"', name:'Lisa Liang', role:'Associate Engineer, Stripe', initials:'LL', stars:5 },
              { text:'"I used the Skill Gap Analyzer for my Sales → Product transition. The 9-week roadmap had me picking SQL certs that recruiters loved."', name:'Marcus K.', role:'Product Manager, Cisco', initials:'MK', stars:5 },
            ].map((t, i) => (
              <div key={i} className="glass-panel reveal card-glow-purple" style={{ padding:'2rem', display:'flex', flexDirection:'column', gap:'1.25rem', animationDelay:`${i*0.15}s` }}>
                <div style={{ display:'flex', gap:'3px', marginBottom:'0.25rem' }}>
                  {Array(t.stars).fill(0).map((_,j)=><Star key={j} size={14} fill="var(--accent-amber)" color="var(--accent-amber)" />)}
                </div>
                <p style={{ color:'var(--color-text-secondary)', fontSize:'0.92rem', lineHeight:1.75, fontStyle:'italic' }}>"{t.text}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div style={{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.8rem', flexShrink:0 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.9rem' }}>{t.name}</div>
                    <div style={{ color:'var(--color-text-muted)', fontSize:'0.78rem' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ ...s.altSection, textAlign:'center' }}>
        <div style={{ maxWidth:620, margin:'0 auto', padding:'0 2rem' }}>
          <div className="reveal" style={{ fontSize:'3rem', marginBottom:'1rem' }}>🚀</div>
          <h2 className="reveal" style={{ ...s.sectionTitle, fontSize:'2.5rem' }}>Ready to Forge Your Career?</h2>
          <p className="reveal" style={{ ...s.sectionSubtitle, marginBottom:'2.5rem' }}>Join 12,000+ students already using CareerForge AI to land their dream jobs.</p>
          <div className="reveal" style={{ display:'flex', gap:'1rem', justifyContent:'center' }}>
            <button className="btn btn-primary" style={{ fontSize:'1rem', padding:'0.95rem 2.2rem' }} onClick={() => onNavigate('register')}>
              <Zap size={18} /> Get Started Free
            </button>
            <button className="btn btn-secondary" style={{ fontSize:'1rem', padding:'0.95rem 2.2rem' }} onClick={() => onNavigate('login')}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section style={s.section}>
        <div style={{ maxWidth:680, margin:'0 auto', padding:'0 2rem' }}>
          <div className="glass-panel reveal" style={{ padding:'3rem' }}>
            <div className="section-label" style={{ marginBottom:'0.75rem' }}>Contact</div>
            <h2 style={{ fontSize:'1.9rem', fontWeight:800, marginBottom:'0.5rem' }}>Get In Touch</h2>
            <p style={{ color:'var(--color-text-secondary)', marginBottom:'2rem', fontSize:'0.95rem' }}>Questions about licensing CareerForge AI for your bootcamp or college?</p>
            {submitted ? (
              <div style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'var(--accent-emerald)', padding:'1.25rem', borderRadius:12, display:'flex', alignItems:'center', gap:'0.75rem', animation:'fadeInScale 0.4s ease' }}>
                <CheckCircle size={20} /> Thank you! We'll be in touch within 24 hours.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control" required value={contactForm.name} onChange={e=>setContactForm({...contactForm,name:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control" required value={contactForm.email} onChange={e=>setContactForm({...contactForm,email:e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea rows="4" className="form-control" required style={{resize:'none'}} value={contactForm.message} onChange={e=>setContactForm({...contactForm,message:e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary">Send Message <ArrowRight size={16}/></button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.3rem', background:'linear-gradient(135deg, var(--accent-purple-light), var(--accent-cyan))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            ⚡ CareerForge AI
          </div>
          <p style={{ color:'var(--color-text-muted)', fontSize:'0.85rem', marginTop:'0.5rem' }}>
            © 2025 CareerForge AI · Entrepreneurship & Innovation Competition
          </p>
        </div>
      </footer>
    </div>
  );
};

const s = {
  heroSection: {
    padding: '7rem 4rem 5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4rem',
    position: 'relative',
    minHeight: '92vh',
  },
  heroBg: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(6,182,212,0.08) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  heroContent: { flex: '1 1 500px', position: 'relative', zIndex: 1 },
  heroBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    background: 'rgba(124,58,237,0.12)',
    border: '1px solid rgba(124,58,237,0.35)',
    color: 'var(--accent-purple-light)',
    padding: '0.38rem 1rem', borderRadius: 999,
    fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
    marginBottom: '1.5rem',
    animation: 'borderGlow 3s ease-in-out infinite',
  },
  heroTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(2.8rem, 5vw, 4.5rem)',
    lineHeight: 1.12, fontWeight: 900, letterSpacing: '-0.04em',
    marginBottom: '1.5rem',
  },
  heroSubtitle: {
    fontSize: '1.1rem', color: 'var(--color-text-secondary)',
    maxWidth: 540, marginBottom: '2.5rem', lineHeight: 1.8,
  },
  heroActions: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' },
  statPills: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  statPill: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-glass)',
    padding: '0.5rem 1rem', borderRadius: 999, fontSize: '0.88rem', fontWeight: 600,
    animation: 'float 4s ease-in-out infinite',
  },
  mockupWrap: {
    flex: '1 1 400px', position: 'relative', zIndex: 1,
    display: 'flex', justifyContent: 'center',
    animation: 'float 5s ease-in-out infinite',
  },
  mockupCard: {
    width: '100%', maxWidth: 420,
    overflow: 'hidden', borderRadius: 20,
  },
  mockupHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.75rem 1.25rem',
    background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid var(--border-glass)',
  },
  mockupBody: { padding: '1.5rem' },
  mockupTwinBox: {
    background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)',
    borderRadius: 12, padding: '1rem', marginTop: '0.5rem',
  },
  mockupScenario: {
    display: 'flex', alignItems: 'center',
    padding: '0.4rem 0.75rem', borderRadius: 8,
    border: '1px solid', fontSize: '0.78rem', fontWeight: 600,
    marginBottom: '0.5rem', background: 'rgba(0,0,0,0.02)',
  },
  statsBar: {
    display: 'flex', justifyContent: 'center',
    gap: '0', borderTop: '1px solid var(--border-glass)',
    borderBottom: '1px solid var(--border-glass)',
    background: 'rgba(255,255,255,0.5)',
    flexWrap: 'wrap',
  },
  statItem: {
    padding: '2.5rem 3.5rem', textAlign: 'center',
    borderRight: '1px solid var(--border-glass)',
    flex: '1 1 200px',
  },
  statValue: {
    fontSize: '2.4rem', fontWeight: 900, fontFamily: 'var(--font-display)',
    background: 'linear-gradient(135deg, var(--accent-purple-light), var(--accent-cyan))',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  statLabel: { color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '0.3rem', fontWeight: 500 },
  section: { padding: '6rem 4rem' },
  altSection: {
    padding: '6rem 4rem',
    background: 'rgba(255,255,255,0.5)',
    borderTop: '1px solid var(--border-glass)',
    borderBottom: '1px solid var(--border-glass)',
  },
  sectionInner: { maxWidth: 1200, margin: '0 auto' },
  sectionTitle: {
    fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800,
    textAlign: 'center', marginBottom: '0.75rem',
  },
  sectionSubtitle: {
    textAlign: 'center', color: 'var(--color-text-secondary)',
    fontSize: '1.05rem', marginBottom: '3.5rem', maxWidth: 560, margin: '0 auto 3.5rem',
  },
  grid3: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '1.75rem',
  },
  featuresLayout: {
    display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start',
  },
  featureTabs: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  featureTab: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.85rem 1.1rem', border: '1px solid', borderRadius: 10,
    cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600,
    transition: 'all 0.25s ease', textAlign: 'left',
  },
  featureDetail: {
    padding: '2.5rem', minHeight: 280,
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    animation: 'fadeInScale 0.4s ease both',
  },
  footer: {
    borderTop: '1px solid var(--border-glass)',
    padding: '2.5rem 4rem', textAlign: 'center',
  },
  footerInner: { maxWidth: 1200, margin: '0 auto' },
};

export default LandingPage;
