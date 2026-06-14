import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { UserPlus, AlertCircle, ArrowRight } from 'lucide-react';

export const Register = ({ onNavigate }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await register(email, password, fullName, role);
      if (user.role === 'admin') {
        onNavigate('admin');
      } else {
        onNavigate('dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Try using a unique email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Orbs */}
      <div className="bg-orb bg-orb-3" style={{ top: '10%', left: '10%', animationDuration: '18s' }}></div>
      <div className="bg-orb bg-orb-2" style={{ bottom: '10%', right: '10%', animationDuration: '22s' }}></div>

      <div className="glass-panel animate-fadeInUp" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>⚡ CareerForge</div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join thousands of students forging their futures.</p>
        </div>

        {error && (
          <div className="animate-fadeInScale" style={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group" style={{ animation: 'fadeInLeft 0.5s ease-out 0.1s both' }}>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Alex Mercer"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ animation: 'fadeInLeft 0.5s ease-out 0.2s both' }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. alex@gmail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ animation: 'fadeInLeft 0.5s ease-out 0.3s both' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Min. 6 characters"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ animation: 'fadeInLeft 0.5s ease-out 0.4s both' }}>
            <label className="form-label">User Role</label>
            <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student / Job Seeker</option>
              <option value="admin">Administrator / Evaluator</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem', animation: 'fadeInUp 0.5s ease-out 0.5s both' }} 
            disabled={loading}
          >
            {loading ? 'Forging Account...' : <><UserPlus size={18} /> Create Account <ArrowRight size={16}/></>}
          </button>
        </form>

        <div style={styles.footer} className="animate-fadeIn 0.5s ease-out 0.6s both">
          Already have an account?{' '}
          <span style={styles.link} onClick={() => onNavigate('login')}>
            Sign In
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 66px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: '2rem',
    overflow: 'hidden',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    padding: '3rem 2.5rem',
    zIndex: 2,
    position: 'relative',
    borderTop: '1px solid rgba(0,0,0,0.1)',
    borderLeft: '1px solid rgba(0,0,0,0.05)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontWeight: '900',
    fontSize: '1.2rem',
    background: 'linear-gradient(135deg, var(--accent-purple-light), var(--accent-cyan))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.95rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--color-error)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '1rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: 'var(--color-text-secondary)',
  },
  link: {
    color: 'var(--accent-purple-light)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
};
export default Register;
