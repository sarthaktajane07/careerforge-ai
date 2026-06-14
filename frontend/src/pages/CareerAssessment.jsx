import React, { useState, useEffect } from 'react';
import apiService from '../services/api.js';
import { Compass, Award, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const CareerAssessment = ({ onComplete }) => {
  const [answers, setAnswers] = useState({
    interest: 'technical',
    codingExp: 'intermediate',
    workStyle: 'collaborative',
    designPref: 'uninterested'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const hist = await apiService.getAssessmentHistory();
      setHistory(hist);
    } catch (error) {
      console.error('Failed to load assessment history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiService.submitAssessment(answers);
      setResult(data);
      await loadHistory();
    } catch (error) {
      alert('Error submitting assessment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={styles.header}>
        <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={24} color="var(--accent-purple)" /> Career Assessment AI
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Identify your core technical strengths, clarify path directions, and score your capability indices.</p>
      </div>

      <div className="grid-cols-12">
        {/* Left Side: Assessment Form or Result */}
        <div className="glass-panel span-8" style={{ padding: '2rem' }}>
          {!result ? (
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Career Questionnaire</h3>
              
              <div className="form-group">
                <label className="form-label">What is your primary technology focus / interest?</label>
                <select 
                  className="form-control" 
                  value={answers.interest}
                  onChange={(e) => setAnswers({ ...answers, interest: e.target.value })}
                >
                  <option value="technical">Backend Systems & Algorithmic Programming</option>
                  <option value="design">UI/UX Design & Frontend Development</option>
                  <option value="business">Product Management & Business Analysis</option>
                  <option value="consultant">General Technology consulting & Architecture</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">How would you rate your current coding expertise?</label>
                <select 
                  className="form-control" 
                  value={answers.codingExp}
                  onChange={(e) => setAnswers({ ...answers, codingExp: e.target.value })}
                >
                  <option value="none">No experience / Uninterested in coding</option>
                  <option value="beginner">Beginner (Know basic HTML/CSS variables)</option>
                  <option value="intermediate">Intermediate (Build projects using JavaScript & React)</option>
                  <option value="advanced">Advanced (Understand systems complexity & deployment)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">What is your preferred professional style?</label>
                <select 
                  className="form-control" 
                  value={answers.workStyle}
                  onChange={(e) => setAnswers({ ...answers, workStyle: e.target.value })}
                >
                  <option value="independent">Independent problem solver (Solo coder)</option>
                  <option value="collaborative">Collaborative builder (Agile teams)</option>
                  <option value="consulting">Client-facing consulting (Stakeholder briefs)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">What is your visual design preference?</label>
                <select 
                  className="form-control" 
                  value={answers.designPref}
                  onChange={(e) => setAnswers({ ...answers, designPref: e.target.value })}
                >
                  <option value="uninterested">No interest (Prefer logic and infrastructure)</option>
                  <option value="research">User research focus (Creating wireframe maps)</option>
                  <option value="visual">High-fidelity UI focus (Designing pixel layouts)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                {loading ? 'Processing assessment...' : 'Submit Evaluation'}
              </button>
            </form>
          ) : (
            <div>
              <div style={styles.resultHeader}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: '#10b981' }}>Assessment Complete</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Here are your AI-generated recommended career trajectories.</p>
                </div>
                <div style={styles.scoreContainer}>
                  <div style={styles.scoreLabel}>Assessment Index</div>
                  <div style={styles.scoreVal}>{result.score}%</div>
                </div>
              </div>

              <div style={styles.resultBlock}>
                <h4 style={styles.blockTitle}>Recommended Paths</h4>
                <div style={styles.tagsContainer}>
                  {result.recommendedPaths.map((p, idx) => (
                    <span key={idx} style={styles.tag}>{p}</span>
                  ))}
                </div>
              </div>

              <div style={styles.resultGrid}>
                <div className="glass-panel" style={{ ...styles.cardSub, borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                  <h4 style={{ color: '#10b981', marginBottom: '0.75rem' }}>Strengths</h4>
                  <ul style={styles.ul}>
                    {result.strengths.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
                <div className="glass-panel" style={{ ...styles.cardSub, borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <h4 style={{ color: '#ef4444', marginBottom: '0.75rem' }}>Weaknesses</h4>
                  <ul style={styles.ul}>
                    {result.weaknesses.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              </div>

              <div className="glass-panel" style={{ ...styles.cardSub, marginTop: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ color: 'var(--accent-purple)', marginBottom: '0.75rem' }}>Suggested Action Plan</h4>
                <ul style={styles.ul}>
                  {result.careerSuggestions.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button className="btn btn-primary" onClick={() => setResult(null)}>Retake Assessment</button>
                <button className="btn btn-secondary" onClick={onComplete}>Back to Dashboard</button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Assessments History list */}
        <div className="glass-panel span-4" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} /> Assessment History
          </h3>
          
          {historyLoading ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading logs...</p>
          ) : history.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>No past assessments. Take your first quiz today!</p>
          ) : (
            <div style={styles.historyList}>
              {history.map((hist) => (
                <div key={hist.id} style={styles.historyItem}>
                  <div style={styles.historyMeta}>
                    <span style={{ fontWeight: '700' }}>Score: {hist.score}%</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(hist.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    Paths: {hist.recommended_paths?.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: {
    marginBottom: '2.5rem',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid var(--border-glass)',
    marginBottom: '1.5rem',
  },
  scoreContainer: {
    textAlign: 'center',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    padding: '0.5rem 1.25rem',
    borderRadius: '12px',
  },
  scoreLabel: {
    fontSize: '0.7rem',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
  },
  scoreVal: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#10b981',
    fontFamily: 'var(--font-display)',
  },
  resultBlock: {
    marginBottom: '1.5rem',
  },
  blockTitle: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
    letterSpacing: '0.05em',
  },
  tagsContainer: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  tag: {
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    color: '#a5b4fc',
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  resultGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  cardSub: {
    padding: '1.25rem',
    borderRadius: '8px',
  },
  ul: {
    listStyleType: 'square',
    paddingLeft: '1.25rem',
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.6',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  historyItem: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-glass)',
    borderRadius: '8px',
    padding: '1rem',
  },
  historyMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
  }
};
export default CareerAssessment;
