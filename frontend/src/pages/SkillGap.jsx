import React, { useState, useEffect } from 'react';
import apiService from '../services/api.js';
import { GitMerge, Award, Clock, Target, Calendar, CheckSquare } from 'lucide-react';
import SkillRadarChart from '../components/SkillRadarChart.jsx';

export const SkillGap = () => {
  const [currentSkills, setCurrentSkills] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const hist = await apiService.getSkillGapHistory();
      setHistory(hist);
    } catch (error) {
      console.error('Failed to load skill gap history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentSkills || !targetRole) return;

    setLoading(true);
    try {
      const data = await apiService.analyzeSkillGap(currentSkills, targetRole);
      setResult(data);
      await loadHistory();
    } catch (error) {
      alert('Error generating skill gap analysis: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={styles.header}>
        <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GitMerge size={24} color="var(--accent-purple)" /> Skill Gap & Learning Roadmap
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Cross-reference your active skillsets against industry roles, find technology gaps, and receive a customized certification roadmap.</p>
      </div>

      <div className="grid-cols-12">
        {/* Main interactive panel */}
        <div className="glass-panel span-8" style={{ padding: '2rem' }}>
          {!result ? (
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Map New Skill Gap Report</h3>
              
              <div className="form-group">
                <label className="form-label">Current Technologies (comma-separated)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. JavaScript, React, HTML, CSS, Git"
                  required
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Job Role</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Full Stack Developer, DevOps Engineer, Data Analyst"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                Submitting this form updates your profile target job role and lists, syncs your skills index score, and maps weekly learning items.
              </p>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Running analysis...' : 'Generate Roadmap'}
              </button>
            </form>
          ) : (
            <div>
              <div style={styles.resultHeader}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: '#06b6d4' }}>Roadmap Generated</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Target: <strong>{result.targetRole}</strong>
                  </p>
                </div>
                <div style={styles.scoreContainer}>
                  <div style={styles.scoreLabel}>Skills Match</div>
                  <div style={{ ...styles.scoreVal, color: result.skillsScore >= 80 ? '#10b981' : '#06b6d4' }}>
                    {result.skillsScore}%
                  </div>
                </div>
              </div>

              {/* Animated Radar Chart side-by-side with Missing Skills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h4 style={{ ...styles.blockTitle, marginBottom: '1rem', alignSelf: 'flex-start' }}>Skill Profile Analysis</h4>
                  <SkillRadarChart 
                    size={260} 
                    skills={[
                      { label: 'Core Base', value: result.skillsScore },
                      { label: 'Tooling', value: Math.min(100, result.skillsScore + 15) },
                      { label: 'Advanced', value: 30 },
                      { label: 'Architecture', value: 50 },
                      { label: 'Security', value: 40 },
                      { label: 'Optimization', value: 25 },
                    ]} 
                  />
                </div>

                <div>
                  <div style={styles.resultBlock}>
                    <h4 style={styles.blockTitle}>Critical Gaps (Missing)</h4>
                    <div style={styles.tagsContainer}>
                      {result.missingSkills.map((s, idx) => (
                        <span key={idx} style={{ ...styles.tag, background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}>{s}</span>
                      ))}
                    </div>
                  </div>

                  <div style={styles.resultBlock}>
                    <h4 style={styles.blockTitle}>Recommended Expansion</h4>
                    <div style={styles.tagsContainer}>
                      {result.recommendedTech.map((t, idx) => (
                        <span key={idx} style={styles.tag}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Roadmap Milestones */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={styles.blockTitle}>9-Week Milestones Roadmap</h4>
                <div style={styles.timeline}>
                  {result.learningRoadmap.map((item, idx) => (
                    <div key={idx} style={styles.timelineItem}>
                      <div style={styles.timelinePoint}>
                        <Calendar size={14} color="#fff" />
                      </div>
                      <div className="glass-panel" style={styles.timelineCard}>
                        <div style={styles.timelineMeta}>
                          <span style={styles.timelineStep}>{item.step}</span>
                          <span style={styles.timelineTime}>{item.timeline}</span>
                        </div>
                        <div style={styles.timelineTopic}>{item.topic}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Certifications */}
              <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(99, 102, 241, 0.02)' }}>
                <h4 style={{ color: 'var(--accent-purple)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Award size={18} /> Suggested Certifications
                </h4>
                <ul style={styles.ul}>
                  {result.certifications.map((item, idx) => <li key={idx} style={{ marginBottom: '0.25rem' }}><strong>{item}</strong></li>)}
                </ul>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button className="btn btn-primary" onClick={() => setResult(null)}>Run New Analysis</button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Previous audit reports */}
        <div className="glass-panel span-4" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} /> Analysis Logs
          </h3>

          {historyLoading ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading logs...</p>
          ) : history.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>No past roadmaps generated. Submit your target career goal above!</p>
          ) : (
            <div style={styles.historyList}>
              {history.map((hist) => (
                <div key={hist.id} style={styles.historyItem}>
                  <div style={styles.historyMeta}>
                    <span style={{ fontWeight: '700' }}>Match: {hist.skills_score}%</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(hist.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    Role: {hist.target_role}
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
    background: 'rgba(6, 182, 212, 0.15)',
    border: '1px solid rgba(6, 182, 212, 0.3)',
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
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    position: 'relative',
    paddingLeft: '1.5rem',
    borderLeft: '2px solid var(--border-glass)',
    marginTop: '1rem',
  },
  timelineItem: {
    position: 'relative',
  },
  timelinePoint: {
    position: 'absolute',
    left: '-32px',
    top: '12px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 10px rgba(6, 182, 212, 0.4)',
  },
  timelineCard: {
    padding: '1.25rem',
  },
  timelineMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '0.5rem',
  },
  timelineStep: {
    fontWeight: '700',
    color: 'var(--color-text-primary)',
  },
  timelineTime: {
    fontStyle: 'italic',
    color: 'var(--accent-cyan)',
    fontWeight: '600',
  },
  timelineTopic: {
    fontSize: '0.9rem',
    lineHeight: '1.5',
  },
  ul: {
    listStyleType: 'square',
    paddingLeft: '1.25rem',
    fontSize: '0.9rem',
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
export default SkillGap;
