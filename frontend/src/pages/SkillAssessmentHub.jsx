import React, { useState, useEffect } from 'react';
import apiService from '../services/api.js';
import { Award, Code, CheckCircle, XCircle, ArrowRight, Trophy, RefreshCw, Star } from 'lucide-react';

export const SkillAssessmentHub = () => {
  const [view, setView] = useState('home'); // home, testing, result, leaderboard
  const [categories, setCategories] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Test State
  const [currentTest, setCurrentTest] = useState(null); // attemptId, questions, skillName
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]); // [{questionId, selectedOptionId}]
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (view === 'home') loadHomeData();
    if (view === 'leaderboard') loadLeaderboardData();
  }, [view]);

  const loadHomeData = async () => {
    setLoading(true);
    try {
      // Create a specific API method in api.js later, for now we can just use raw fetch with token
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/skillassessment/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch skill lists');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/skillassessment/leaderboard');
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (skillId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/skillassessment/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ skillId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to start test');
      
      setCurrentTest(data);
      setCurrentQuestionIndex(0);
      setSelectedAnswers([]);
      setView('testing');
    } catch (err) {
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId, optionId) => {
    const existing = selectedAnswers.find(a => a.questionId === questionId);
    if (existing) {
      setSelectedAnswers(selectedAnswers.map(a => a.questionId === questionId ? { questionId, selectedOptionId: optionId } : a));
    } else {
      setSelectedAnswers([...selectedAnswers, { questionId, selectedOptionId: optionId }]);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitTest();
    }
  };

  const submitTest = async () => {
    setTestSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/skillassessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          attemptId: currentTest.attemptId,
          answers: selectedAnswers
        })
      });
      if (!res.ok) throw new Error('Submission failed');
      const data = await res.json();
      setTestResult(data);
      setView('result');
    } catch (err) {
      alert(err.message);
    } finally {
      setTestSubmitting(false);
    }
  };

  if (loading && view === 'home') {
    return (
      <div style={styles.centerBox}>
        <RefreshCw size={40} className="spin" style={{ color: 'var(--accent-cyan)' }} />
        <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Loading Skill Hub...</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Award size={28} color="var(--accent-cyan)" /> 
            AI Skill Assessment Hub
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
            Validate your actual skills through structured MCQ tests, earn badges, and feed accurate data into your Career Twin AI.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {view !== 'home' && (
            <button className="btn btn-secondary" onClick={() => setView('home')}>Back to Hub</button>
          )}
          {view !== 'leaderboard' && (
            <button className="btn btn-primary" onClick={() => setView('leaderboard')}>
              <Trophy size={16} style={{marginRight: '0.5rem'}} /> Leaderboard
            </button>
          )}
        </div>
      </div>

      {/* HOME VIEW */}
      {view === 'home' && (
        <div style={styles.grid}>
          {categories.map(cat => (
            <div key={cat.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                {cat.category_name}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cat.skills.map(skill => (
                  <div key={skill.id} style={styles.skillCard}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{skill.skill_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Highest Score: {skill.highest_score}%</div>
                      {skill.badge && (
                        <div style={styles.badge}>
                          <Star size={12} /> {skill.badge}
                        </div>
                      )}
                    </div>
                    <button className="btn btn-primary" style={{ padding: '0.4rem 1rem' }} onClick={() => startTest(skill.id)}>
                      Take Test
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {categories.length === 0 && !loading && (
            <div style={{...styles.centerBox, gridColumn: 'span 2'}}>
              <p>No skills available. Please ask admin to seed the question bank.</p>
            </div>
          )}
        </div>
      )}

      {/* TESTING VIEW */}
      {view === 'testing' && currentTest && (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem' }}>{currentTest.skillName} Assessment</h3>
            <div style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: '700' }}>
              Question {currentQuestionIndex + 1} of {currentTest.questions.length}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Difficulty: {currentTest.questions[currentQuestionIndex].difficulty}
            </div>
            <h4 style={{ fontSize: '1.2rem', lineHeight: '1.5' }}>
              {currentTest.questions[currentQuestionIndex].question_text}
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
            {currentTest.questions[currentQuestionIndex].options.map(opt => {
              const isSelected = selectedAnswers.find(a => a.questionId === currentTest.questions[currentQuestionIndex].id)?.selectedOptionId === opt.id;
              return (
                <div 
                  key={opt.id} 
                  style={{...styles.optionCard, borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border-glass)', background: isSelected ? 'rgba(6, 182, 212, 0.05)' : 'transparent'}}
                  onClick={() => handleOptionSelect(currentTest.questions[currentQuestionIndex].id, opt.id)}
                >
                  <div style={{...styles.radioCircle, background: isSelected ? 'var(--accent-cyan)' : 'transparent'}}></div>
                  <span>{opt.option_text}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={nextQuestion} disabled={testSubmitting}>
              {testSubmitting ? 'Submitting...' : currentQuestionIndex === currentTest.questions.length - 1 ? 'Finish & Grade' : 'Next Question'} <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
            </button>
          </div>
        </div>
      )}

      {/* RESULT VIEW */}
      {view === 'result' && testResult && (
        <div className="glass-panel animate-slideInCard" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Test Complete!</h2>
            <div style={{ fontSize: '4rem', fontWeight: '800', color: testResult.percentage >= 70 ? 'var(--color-success)' : 'var(--accent-cyan)', fontFamily: 'var(--font-display)' }}>
              {Math.round(testResult.percentage)}%
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem', color: 'var(--color-text-secondary)' }}>
              <span><CheckCircle size={16} color="var(--color-success)" style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'text-bottom' }}/> {testResult.correct} Correct</span>
              <span><XCircle size={16} color="var(--color-error)" style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'text-bottom' }}/> {testResult.wrong} Incorrect</span>
              <span><strong>Level:</strong> {testResult.level}</span>
            </div>
          </div>

          {testResult.newBadge && (
            <div style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(6, 182, 212, 0.2))', border: '1px solid var(--accent-purple)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', marginBottom: '2.5rem' }}>
              <Trophy size={40} color="var(--accent-purple)" style={{ marginBottom: '0.5rem' }} />
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-text-primary)' }}>New Badge Unlocked!</h3>
              <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>{testResult.newBadge}</p>
            </div>
          )}

          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>AI Performance Report</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <strong style={{ color: 'var(--color-success)' }}>Strengths:</strong>
              <p style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>{testResult.report.strengths}</p>
            </div>
            <div>
              <strong style={{ color: 'var(--color-error)' }}>Weaknesses:</strong>
              <p style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>{testResult.report.weaknesses}</p>
            </div>
            <div>
              <strong style={{ color: 'var(--accent-cyan)' }}>Topics to Improve:</strong>
              <p style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>{testResult.report.topicsToImprove}</p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-purple)' }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Recommended Learning Plan:</strong>
              <ul style={{ listStylePosition: 'inside', color: 'var(--color-text-secondary)' }}>
                <li><strong>Plan:</strong> {testResult.report.learningPlan}</li>
                <li><strong>Course:</strong> {testResult.report.recommendedCourses}</li>
                <li><strong>Target Certification:</strong> {testResult.report.recommendedCertifications}</li>
              </ul>
            </div>
          </div>
          
          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <button className="btn btn-primary" onClick={() => setView('home')}>Back to Hub</button>
          </div>
        </div>
      )}

      {/* LEADERBOARD VIEW */}
      {view === 'leaderboard' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}><Trophy size={20} style={{ display: 'inline', marginRight: '0.5rem' }} /> Global Leaderboard</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <th style={{ padding: '1rem' }}>Rank</th>
                  <th style={{ padding: '1rem' }}>Student Name</th>
                  <th style={{ padding: '1rem' }}>Skill</th>
                  <th style={{ padding: '1rem' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: '700', color: index < 3 ? 'var(--accent-cyan)' : 'inherit' }}>#{index + 1}</td>
                    <td style={{ padding: '1rem' }}>{entry.student_name}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                        {entry.skill_name}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '700' }}>{entry.highest_score}%</td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No scores recorded yet. Be the first!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    background: 'rgba(0,0,0,0.2)',
    padding: '2rem',
    borderRadius: '16px',
    border: '1px solid var(--border-glass)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  skillCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    background: 'rgba(168, 85, 247, 0.15)',
    color: '#c084fc',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    marginTop: '0.5rem',
  },
  centerBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  optionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem',
    border: '1px solid var(--border-glass)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '1rem',
  },
  radioCircle: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid var(--border-glass)',
    flexShrink: 0,
  }
};
