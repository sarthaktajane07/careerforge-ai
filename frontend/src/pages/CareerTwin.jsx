import React, { useState, useEffect } from 'react';
import apiService from '../services/api.js';
import { Target, TrendingUp, Clock, AlertTriangle, ArrowRight, Lightbulb, ShieldCheck } from 'lucide-react';
import CareerTwinTree from '../components/CareerTwinTree.jsx';
import TerminalLoader from '../components/TerminalLoader.jsx';
import TiltCard from '../components/TiltCard.jsx';

export const CareerTwin = () => {
  const [education, setEducation] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const hist = await apiService.getCareerTwinHistory();
      setHistory(hist);
    } catch (error) {
      console.error('Failed to load career twin simulations:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    // Pre-populate fields based on user profile on load
    const fetchProfile = async () => {
      try {
        const prof = await apiService.getProfile();
        if (prof.profile) {
          setEducation(prof.profile.education || '');
          setCurrentSkills(prof.profile.skills || '');
          setCareerGoal(prof.profile.target_job_role || '');
        }
      } catch (err) {
        console.error('Failed to pre-populate career twin fields:', err);
      }
    };

    fetchProfile();
    loadHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!education || !currentSkills || !careerGoal) return;

    setLoading(true);
    try {
      const data = await apiService.simulateCareerTwin(education, currentSkills, careerGoal);
      setResult(data);
      await loadHistory();
    } catch (error) {
      alert('Error simulating career twin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={styles.header}>
        <div style={styles.uspTag}>PLATFORM UNIQUE VALUE PROPOSITION (USP)</div>
        <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <Target size={24} color="var(--accent-cyan)" /> Career Twin AI Simulations
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Model three distinct future realities (Current, Recommended, and Best Possible Paths) to project salary scopes, milestones, and timelines.</p>
      </div>

      <div className="grid-cols-12">
        {/* Left Panel: Simulator Form or Scenarios Display */}
        <div className="glass-panel span-9" style={{ padding: '2rem' }}>
          {!result ? (
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Run Future Trajectory Simulations</h3>
              
              <div className="form-group">
                <label className="form-label">Highest Level of Education</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. B.S. in Computer Science"
                  required
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Professional Skills</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. JavaScript, HTML, CSS, basic React"
                  required
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Desired Ultimate Career Goal</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Senior Software Engineer / Lead Solutions Architect"
                  required
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                />
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                This simulation compiles three future tracks based on historical talent paths, indexing certifications and tooling dependencies.
              </p>

              <button type="submit" className="btn btn-accent" disabled={loading}>
                {loading ? 'Running Simulations...' : '🚀 Generate Career Simulations'}
              </button>
            </form>
          ) : loading ? (
            <TerminalLoader label="Generating Career Twin..." durationMs={2800} />
          ) : (
            <div className="animate-fadeIn">
              {/* Animated SVG Career Tree — the flagship visual */}
              <CareerTwinTree report={result} />

              <div style={styles.resultHeader}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--accent-purple)' }}>Simulated Reality Maps</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Ultimate Target: <strong>{result.careerGoal}</strong>
                  </p>
                </div>
                <button className="btn btn-secondary" onClick={() => setResult(null)}>Reset Simulation</button>
              </div>

              {/* Scenarios Side-By-Side Grid with TiltCard 3D effect */}
              <div style={styles.twinGrid}>
                {/* Scenario A */}
                <TiltCard className="glass-panel" style={{ ...styles.twinCol, borderColor: 'var(--border-glass)' }}>
                  <div style={styles.scenarioLabel}>📍 Scenario A: Current Path</div>
                  <div style={styles.twinRole}>{result.scenarioA.role}</div>
                  <div style={styles.twinTimeline}><Clock size={14} /> Timeline: {result.scenarioA.timeline}</div>
                  <div style={styles.twinSalary}>{result.scenarioA.salary}</div>
                  <p style={styles.twinDesc}>{result.scenarioA.description}</p>
                  
                  <div style={styles.milestonesBlock}>
                    <h5 style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Milestones:</h5>
                    <ul style={styles.ul}>
                      {result.scenarioA.milestones?.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>
                </TiltCard>

                {/* Scenario B */}
                <TiltCard className="glass-panel" style={{ ...styles.twinCol, borderColor: 'rgba(79,70,229,0.45)', boxShadow: '0 8px 32px rgba(79,70,229,0.1)' }}>
                  <div style={{ ...styles.scenarioLabel, color: 'var(--accent-purple)' }}>⭐ Scenario B: Recommended Path</div>
                  <div style={{ ...styles.twinRole, color: 'var(--accent-purple)' }}>{result.scenarioB.role}</div>
                  <div style={{ ...styles.twinTimeline, color: 'var(--accent-purple)' }}><Clock size={14} /> Timeline: {result.scenarioB.timeline}</div>
                  <div style={styles.twinSalary}>{result.scenarioB.salary}</div>
                  <p style={styles.twinDesc}>{result.scenarioB.description}</p>
                  
                  <div style={styles.milestonesBlock}>
                    <h5 style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Lightbulb size={12} color="var(--accent-purple)" /> Skills to Learn:
                    </h5>
                    <div style={styles.skillsTagList}>
                      {result.scenarioB.skillsToLearn?.map((s, i) => <span key={i} style={styles.skillTag}>{s}</span>)}
                    </div>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      <strong>Certifications:</strong> {result.scenarioB.certifications?.join(', ')}
                    </div>
                  </div>
                </TiltCard>

                {/* Scenario C */}
                <TiltCard className="glass-panel" style={{ ...styles.twinCol, borderColor: 'rgba(14,165,233,0.45)', boxShadow: '0 8px 32px rgba(14,165,233,0.15)' }}>
                  <div style={{ ...styles.scenarioLabel, color: 'var(--accent-cyan)' }}>🚀 Scenario C: Best Possible Growth</div>
                  <div style={{ ...styles.twinRole, color: 'var(--accent-cyan)' }}>{result.scenarioC.role}</div>
                  <div style={{ ...styles.twinTimeline, color: 'var(--accent-cyan)' }}><Clock size={14} /> Timeline: {result.scenarioC.timeline}</div>
                  <div style={styles.twinSalary}>{result.scenarioC.salary}</div>
                  <p style={styles.twinDesc}>{result.scenarioC.description}</p>
                  
                  <div style={styles.milestonesBlock}>
                    <h5 style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ShieldCheck size={12} color="var(--accent-cyan)" /> High-Impact Skills:
                    </h5>
                    <div style={styles.skillsTagList}>
                      {result.scenarioC.advancedSkills?.map((s, i) => <span key={i} style={{ ...styles.skillTag, background: 'rgba(14,165,233,0.1)', borderColor: 'rgba(14,165,233,0.3)', color: 'var(--accent-cyan)' }}>{s}</span>)}
                    </div>
                    <ul style={{ ...styles.ul, marginTop: '0.75rem', fontSize: '0.75rem' }}>
                      {result.scenarioC.milestones?.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>
                </TiltCard>
              </div>

              {/* USP Highlight Chart (Custom SVG salary progression) */}
              <div className="glass-panel" style={styles.chartPanel}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} color="var(--accent-cyan)" /> Projected Salary Trajectory Mapping (5-Year Curve)
                </h4>
                
                <div style={styles.chartContainer}>
                  {/* custom SVG chart */}
                  <svg viewBox="0 0 600 240" style={styles.chartSvg}>
                    {/* Grid lines */}
                    <line x1="50" y1="30" x2="570" y2="30" stroke="var(--border-glass)" strokeDasharray="4" />
                    <line x1="50" y1="80" x2="570" y2="80" stroke="var(--border-glass)" strokeDasharray="4" />
                    <line x1="50" y1="130" x2="570" y2="130" stroke="var(--border-glass)" strokeDasharray="4" />
                    <line x1="50" y1="180" x2="570" y2="180" stroke="var(--border-glass)" strokeDasharray="4" />
                    
                    {/* Axis lines */}
                    <line x1="50" y1="30" x2="50" y2="200" stroke="var(--color-text-muted)" />
                    <line x1="50" y1="200" x2="570" y2="200" stroke="var(--color-text-muted)" />
                    
                    {/* Y Axis Labels */}
                    <text x="15" y="35" fill="var(--color-text-muted)" style={styles.chartText}>$200K</text>
                    <text x="15" y="85" fill="var(--color-text-muted)" style={styles.chartText}>$150K</text>
                    <text x="15" y="135" fill="var(--color-text-muted)" style={styles.chartText}>$100K</text>
                    <text x="20" y="185" fill="var(--color-text-muted)" style={styles.chartText}>$50K</text>
                    
                    {/* X Axis Labels */}
                    <text x="50" y="220" fill="var(--color-text-muted)" style={styles.chartText}>Year 1</text>
                    <text x="180" y="220" fill="var(--color-text-muted)" style={styles.chartText}>Year 2</text>
                    <text x="310" y="220" fill="var(--color-text-muted)" style={styles.chartText}>Year 3</text>
                    <text x="440" y="220" fill="var(--color-text-muted)" style={styles.chartText}>Year 4</text>
                    <text x="570" y="220" fill="var(--color-text-muted)" style={styles.chartText} textAnchor="end">Year 5</text>
                    
                    {/* Paths plotting lines */}
                    {/* Scenario A (Current) - Linear/Flat: $60K to $80K */}
                    {/* Mapping values: Y1=$60K(175y), Y2=$65K(170y), Y3=$70K(165y), Y4=$75K(160y), Y5=$80K(155y) */}
                    <path d="M 50 175 L 180 170 L 310 165 L 440 160 L 570 155" fill="none" stroke="var(--color-text-muted)" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="570" cy="155" r="4" fill="var(--color-text-muted)" />

                    {/* Scenario B (Recommended) - Moderate Curve: $60K to $120K */}
                    {/* Mapping: Y1=$60K(175y), Y2=$75K(160y), Y3=$95K(135y), Y4=$110K(120y), Y5=$120K(110y) */}
                    <path d="M 50 175 Q 180 155 310 135 T 570 110" fill="none" stroke="var(--accent-purple)" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="570" cy="110" r="4" fill="var(--accent-purple)" />

                    {/* Scenario C (Best Possible) - Exponential Curve: $60K to $190K */}
                    {/* Mapping: Y1=$60K(175y), Y2=$90K(140y), Y3=$130K(100y), Y4=$165K(65y), Y5=$190K(40y) */}
                    <path d="M 50 175 Q 180 135 310 100 T 570 40" fill="none" stroke="var(--accent-cyan)" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="570" cy="40" r="5" fill="var(--accent-cyan)" />
                  </svg>
                  
                  {/* Legend */}
                  <div style={styles.chartLegend}>
                    <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: 'var(--color-text-muted)' }}></span> Scenario A (Current Path)</div>
                    <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: 'var(--accent-purple)' }}></span> Scenario B (Recommended certifications)</div>
                    <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: 'var(--accent-cyan)' }}></span> Scenario C (Lead AI Architect)</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Simulation History */}
        <div className="glass-panel span-3" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} /> History Runs
          </h3>

          {historyLoading ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading logs...</p>
          ) : history.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>No past twin runs. Initiate your first scenario modeling above!</p>
          ) : (
            <div style={styles.historyList}>
              {history.map((hist) => (
                <div key={hist.id} style={styles.historyItem}>
                  <div style={styles.historyMeta}>
                    <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Goal: {hist.career_goal}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    {new Date(hist.created_at).toLocaleDateString()}
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
  uspTag: {
    background: 'rgba(6, 182, 212, 0.15)',
    border: '1px solid rgba(6, 182, 212, 0.3)',
    color: '#22d3ee',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '800',
    display: 'inline-block',
    letterSpacing: '0.05em',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid var(--border-glass)',
    marginBottom: '2rem',
  },
  twinGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.25rem',
  },
  twinCol: {
    padding: '1.5rem',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  scenarioLabel: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  twinRole: {
    fontSize: '1.2rem',
    fontWeight: '800',
    marginBottom: '0.25rem',
  },
  twinTimeline: {
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginBottom: '0.75rem',
  },
  twinSalary: {
    fontSize: '1.5rem',
    fontWeight: '900',
    color: '#fff',
    fontFamily: 'var(--font-display)',
    marginBottom: '1rem',
  },
  twinDesc: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.5',
    marginBottom: '1.5rem',
  },
  milestonesBlock: {
    borderTop: '1px solid var(--border-glass)',
    paddingTop: '1rem',
    marginTop: 'auto',
  },
  ul: {
    listStyleType: 'square',
    paddingLeft: '1.15rem',
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.5',
  },
  skillsTagList: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap',
  },
  skillTag: {
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.25)',
    color: '#a5b4fc',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  chartPanel: {
    marginTop: '2.5rem',
    padding: '2rem',
  },
  chartContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  chartSvg: {
    width: '100%',
    maxWidth: '560px',
    height: 'auto',
    maxHeight: '240px',
  },
  chartText: {
    fontSize: '10px',
    fontFamily: 'monospace',
  },
  chartLegend: {
    display: 'flex',
    gap: '1.5rem',
    marginTop: '1.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
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
  }
};
export default CareerTwin;
