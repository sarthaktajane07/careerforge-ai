import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { Compass, Sparkles, User, Shield, HelpCircle } from 'lucide-react';
import CursorGlow from './components/CursorGlow.jsx';
import FloatingAssistant from './components/FloatingAssistant.jsx';
import AuroraBackground from './components/AuroraBackground.jsx';

const AppContent = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');

  // Handle client-side routing guards
  const navigate = (page) => {
    // Auth guards
    if ((page === 'dashboard' || page === 'admin') && !user) {
      setCurrentPage('login');
      return;
    }
    if (page === 'admin' && user?.role !== 'admin') {
      setCurrentPage('dashboard');
      return;
    }
    if (page === 'dashboard' && user?.role === 'admin') {
      setCurrentPage('admin');
      return;
    }
    setCurrentPage(page);
  };

  const handleLogoClick = () => {
    if (user) {
      navigate(user.role === 'admin' ? 'admin' : 'dashboard');
    } else {
      navigate('landing');
    }
  };

  return (
    <div className="app-container">
      {/* Dynamic Navigation Header */}
      <nav className="navbar">
        <div className="navbar-brand" style={{ cursor: 'pointer' }} onClick={handleLogoClick}>
          <Sparkles size={22} style={{ color: 'var(--accent-cyan)' }} />
          <span>CareerForge AI</span>
        </div>

        {currentPage === 'landing' ? (
          <>
            <ul className="navbar-links">
              <li><a href="#demo-section" className="navbar-link">Dashboard Demo</a></li>
              <li><a href="#demo-section" style={{ display: 'none' }} className="navbar-link">Features</a></li>
              <li><a href="#demo-section" style={{ display: 'none' }} className="navbar-link">Pricing</a></li>
            </ul>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => navigate('login')} style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}>
                Sign In
              </button>
              <button className="btn btn-primary" onClick={() => navigate('register')} style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}>
                Sign Up
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {user ? (
              <>
                <div style={styles.userBadge} onClick={() => navigate(user.role === 'admin' ? 'admin' : 'dashboard')}>
                  {user.role === 'admin' ? <Shield size={14} color="var(--accent-cyan)" /> : <User size={14} color="var(--accent-purple)" />}
                  <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{user.fullName}</span>
                </div>
                {currentPage !== 'dashboard' && currentPage !== 'admin' && (
                  <button className="btn btn-primary" onClick={() => navigate(user.role === 'admin' ? 'admin' : 'dashboard')} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                    Dashboard
                  </button>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => navigate('login')} style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}>
                  Sign In
                </button>
                <button className="btn btn-primary" onClick={() => navigate('register')} style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}>
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Main Pages Router Injection */}
      <div className="main-content">
        {currentPage === 'landing' && <LandingPage onNavigate={navigate} />}
        {currentPage === 'login' && <Login onNavigate={navigate} />}
        {currentPage === 'register' && <Register onNavigate={navigate} />}
        {currentPage === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {currentPage === 'admin' && <AdminDashboard onNavigate={navigate} />}
      </div>

      {/* Footer (only displayed on Landing and Auth screens) */}
      {(currentPage === 'landing' || currentPage === 'login' || currentPage === 'register') && (
        <footer style={styles.footer}>
          <div style={styles.footerTop}>
            <div>
              <div style={{ ...styles.footerBrand, marginBottom: '0.5rem' }}>
                <Sparkles size={18} style={{ color: 'var(--accent-cyan)' }} />
                <span>CareerForge AI</span>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', maxWidth: '300px' }}>
                AI-Powered Career Development and Interview Preparation System. Empowering students to build roadmaps, practice interviews, and achieve careers.
              </p>
            </div>
            <div style={styles.footerLinksGrid}>
              <div style={styles.footerCol}>
                <span style={styles.footerColTitle}>Modules</span>
                <span style={styles.footerColLink}>Career Assessment</span>
                <span style={styles.footerColLink}>Resume Analyzer</span>
                <span style={styles.footerColLink}>Mock Interviews</span>
              </div>
              <div style={styles.footerCol}>
                <span style={styles.footerColTitle}>USP</span>
                <span style={{ ...styles.footerColLink, color: 'var(--accent-cyan)', fontWeight: '600' }}>Career Twin AI</span>
                <span style={styles.footerColLink}>Skill Gap Analysis</span>
              </div>
              <div style={styles.footerCol}>
                <span style={styles.footerColTitle}>Company</span>
                <span style={styles.footerColLink}>About Us</span>
                <span style={styles.footerColLink}>Terms of Service</span>
              </div>
            </div>
          </div>
          <div style={styles.footerBottom}>
            <span>© 2026 CareerForge AI. Built for Entrepreneurship & Innovation Competitions. All rights reserved.</span>
            <span>Tagline: "Shape Your Future with AI"</span>
          </div>
        </footer>
      )}
      {/* Global Effects */}
      <AuroraBackground />
      <CursorGlow />
      <FloatingAssistant />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const styles = {
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(0,0,0,0.04)',
    border: '1px solid var(--border-glass)',
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    cursor: 'pointer',
  },
  footer: {
    background: '#f1f5f9',
    borderTop: '1px solid var(--border-glass)',
    padding: '4rem 4rem 2rem 4rem',
    marginTop: 'auto',
  },
  footerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '3rem',
    marginBottom: '3rem',
  },
  footerBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: 'var(--font-display)',
    fontWeight: '800',
    fontSize: '1.2rem',
    background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  footerLinksGrid: {
    display: 'flex',
    gap: '4rem',
    flexWrap: 'wrap',
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  footerColTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem',
  },
  footerColLink: {
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
  },
  footerBottom: {
    borderTop: '1px solid var(--border-glass)',
    paddingTop: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
  }
};

export default App;
