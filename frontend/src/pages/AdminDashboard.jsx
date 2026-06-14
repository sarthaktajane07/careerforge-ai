import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import apiService from '../services/api.js';
import { 
  Users, Compass, FileText, HelpCircle, LogOut, RefreshCw, BarChart2, PieChart, Activity 
} from 'lucide-react';

export const AdminDashboard = ({ onNavigate }) => {
  const { logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const analytics = await apiService.getAdminAnalytics();
      setData(analytics);
    } catch (error) {
      console.error('Failed to load admin analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  if (loading && !data) {
    return (
      <div style={styles.loadingContainer}>
        <RefreshCw size={40} className="spin" style={{ color: 'var(--accent-purple)', animation: 'spinSlow 2s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Compiling platform metrics...</p>
      </div>
    );
  }

  // Calculate donut graph values
  const dist = data?.charts?.readinessDistribution || { Beginner: 0, Developing: 0, 'Job Ready': 0, 'Industry Ready': 0 };
  const totalStudents = Object.values(dist).reduce((a, b) => a + b, 0);

  // Percentages for Donut
  const getPercent = (val) => (totalStudents > 0 ? Math.round((val / totalStudents) * 100) : 0);
  const beginnerPct = getPercent(dist.Beginner);
  const developingPct = getPercent(dist.Developing);
  const jobReadyPct = getPercent(dist['Job Ready']);
  const industryReadyPct = getPercent(dist['Industry Ready']);

  return (
    <div className="dashboard-grid">
      {/* Admin Sidebar */}
      <aside className="sidebar">
        <div>
          <div style={styles.sidebarHeader}>
            <div style={styles.adminIcon}><Activity size={20} /></div>
            <div style={styles.userInfo}>
              <div style={{fontWeight: '700', fontSize: '0.95rem'}}>Admin System</div>
              <div style={{color: 'var(--color-text-muted)', fontSize: '0.75rem'}}>Console Portal</div>
            </div>
          </div>
          <ul className="sidebar-menu">
            <li>
              <button className="sidebar-item-link active" style={styles.sidebarBtn}>
                <BarChart2 size={18} /> Analytics Panel
              </button>
            </li>
          </ul>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Admin Dashboard */}
      <main className="dashboard-content">
        <div style={styles.welcomeRow}>
          <div>
            <h1 style={{fontSize: '2rem'}}>System Administration Console</h1>
            <p style={{color: 'var(--color-text-secondary)'}}>Global audit statistics, user assessments indices, and student activity logs.</p>
          </div>
          <button className="btn btn-secondary" onClick={loadAnalytics} style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid-cols-12" style={{marginBottom: '2.5rem'}}>
          <div className="glass-panel span-3" style={styles.statCard}>
            <div style={{...styles.iconWrapper, color: 'var(--accent-purple)', background: 'var(--accent-purple-glow)'}}>
              <Users size={20} />
            </div>
            <div style={styles.statMeta}>
              <span style={styles.statLabel}>Total Users</span>
              <span style={styles.statVal}>{data.metrics.totalUsers}</span>
            </div>
          </div>
          <div className="glass-panel span-3" style={styles.statCard}>
            <div style={{...styles.iconWrapper, color: '#10b981', background: 'rgba(16,185,129,0.15)'}}>
              <Compass size={20} />
            </div>
            <div style={styles.statMeta}>
              <span style={styles.statLabel}>Assessments</span>
              <span style={styles.statVal}>{data.metrics.totalAssessments}</span>
            </div>
          </div>
          <div className="glass-panel span-3" style={styles.statCard}>
            <div style={{...styles.iconWrapper, color: 'var(--accent-cyan)', background: 'var(--accent-cyan-glow)'}}>
              <FileText size={20} />
            </div>
            <div style={styles.statMeta}>
              <span style={styles.statLabel}>Resumes Checked</span>
              <span style={styles.statVal}>{data.metrics.totalResumes}</span>
            </div>
          </div>
          <div className="glass-panel span-3" style={styles.statCard}>
            <div style={{...styles.iconWrapper, color: 'var(--accent-magenta)', background: 'var(--accent-magenta-glow)'}}>
              <HelpCircle size={20} />
            </div>
            <div style={styles.statMeta}>
              <span style={styles.statLabel}>Mock Interviews</span>
              <span style={styles.statVal}>{data.metrics.totalInterviews}</span>
            </div>
          </div>
        </div>

        {/* Analytics Graphs */}
        <div className="grid-cols-12" style={{marginBottom: '2.5rem'}}>
          {/* Average Scores Chart */}
          <div className="glass-panel span-7" style={{padding: '2rem'}}>
            <h3 style={{fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <BarChart2 size={18} color="var(--accent-purple)" /> Platform Averages Score Index
            </h3>
            
            <div style={styles.barChartContainer}>
              <svg viewBox="0 0 500 200" style={styles.chartSvg}>
                {/* Grid guidelines */}
                <line x1="60" y1="20" x2="480" y2="20" stroke="var(--border-glass)" strokeDasharray="4" />
                <line x1="60" y1="65" x2="480" y2="65" stroke="var(--border-glass)" strokeDasharray="4" />
                <line x1="60" y1="110" x2="480" y2="110" stroke="var(--border-glass)" strokeDasharray="4" />
                <line x1="60" y1="155" x2="480" y2="155" stroke="var(--border-glass)" strokeDasharray="4" />
                <line x1="60" y1="155" x2="60" y2="20" stroke="var(--color-text-muted)" />
                <line x1="60" y1="155" x2="480" y2="155" stroke="var(--color-text-muted)" />

                {/* Y Axis */}
                <text x="25" y="25" fill="var(--color-text-muted)" style={styles.chartText}>100%</text>
                <text x="30" y="70" fill="var(--color-text-muted)" style={styles.chartText}>70%</text>
                <text x="30" y="115" fill="var(--color-text-muted)" style={styles.chartText}>40%</text>
                <text x="35" y="160" fill="var(--color-text-muted)" style={styles.chartText}>0%</text>

                {/* X Bars plotting */}
                {/* Resume avg: height calculated based on score */}
                {/* Max height is 135px (155 - 20) */}
                {/* H = (score / 100) * 135 */}
                {/* Y = 155 - H */}
                {/* Resume Bar */}
                <rect x="90" y={155 - (data.charts.averages.resume / 100) * 135} width="35" height={(data.charts.averages.resume / 100) * 135} fill="var(--accent-purple)" rx="3" />
                <text x="107" y={150 - (data.charts.averages.resume / 100) * 135} fill="#fff" textAnchor="middle" style={styles.barText}>{data.charts.averages.resume}%</text>
                <text x="107" y="175" fill="var(--color-text-secondary)" textAnchor="middle" style={styles.chartText}>Resume</text>

                {/* Interview Bar */}
                <rect x="175" y={155 - (data.charts.averages.interview / 100) * 135} width="35" height={(data.charts.averages.interview / 100) * 135} fill="var(--accent-magenta)" rx="3" />
                <text x="192" y={150 - (data.charts.averages.interview / 100) * 135} fill="#fff" textAnchor="middle" style={styles.barText}>{data.charts.averages.interview}%</text>
                <text x="192" y="175" fill="var(--color-text-secondary)" textAnchor="middle" style={styles.chartText}>Interview</text>

                {/* Skills Bar */}
                <rect x="260" y={155 - (data.charts.averages.skills / 100) * 135} width="35" height={(data.charts.averages.skills / 100) * 135} fill="var(--accent-cyan)" rx="3" />
                <text x="277" y={150 - (data.charts.averages.skills / 100) * 135} fill="#fff" textAnchor="middle" style={styles.barText}>{data.charts.averages.skills}%</text>
                <text x="277" y="175" fill="var(--color-text-secondary)" textAnchor="middle" style={styles.chartText}>Skills</text>

                {/* Quiz Bar */}
                <rect x="345" y={155 - (data.charts.averages.assessment / 100) * 135} width="35" height={(data.charts.averages.assessment / 100) * 135} fill="var(--color-success)" rx="3" />
                <text x="362" y={150 - (data.charts.averages.assessment / 100) * 135} fill="#fff" textAnchor="middle" style={styles.barText}>{data.charts.averages.assessment}%</text>
                <text x="362" y="175" fill="var(--color-text-secondary)" textAnchor="middle" style={styles.chartText}>Quiz</text>

                {/* Readiness Bar */}
                <rect x="430" y={155 - (data.charts.averages.readiness / 100) * 135} width="35" height={(data.charts.averages.readiness / 100) * 135} fill="linear-gradient(180deg, var(--accent-purple), var(--accent-cyan))" rx="3" style={{ fill: 'url(#grad-readiness)' }} />
                <text x="447" y={150 - (data.charts.averages.readiness / 100) * 135} fill="#fff" textAnchor="middle" style={styles.barText}>{data.charts.averages.readiness}%</text>
                <text x="447" y="175" fill="var(--color-text-secondary)" textAnchor="middle" style={styles.chartText}>Readiness</text>
                
                <defs>
                  <linearGradient id="grad-readiness" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-purple)" />
                    <stop offset="100%" stopColor="var(--accent-cyan)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Level Distribution Ring Chart */}
          <div className="glass-panel span-5" style={{padding: '2rem'}}>
            <h3 style={{fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={18} color="var(--accent-cyan)" /> Readiness Level Distribution
            </h3>
            
            <div style={styles.donutLayout}>
              {/* simple CSS/SVG circle representation */}
              <div style={styles.donutContainer}>
                <svg width="100" height="100" viewBox="0 0 36 36" style={styles.donutSvg}>
                  <path stroke="var(--border-glass)" strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  
                  {/* segment beginner: orange */}
                  <path stroke="var(--color-error)" strokeWidth="3.5" strokeDasharray={`${beginnerPct}, 100`} strokeDashoffset="0" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  {/* segment developing: orange */}
                  <path stroke="var(--color-warning)" strokeWidth="3.5" strokeDasharray={`${developingPct}, 100`} strokeDashoffset={`-${beginnerPct}`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  {/* segment job ready: cyan */}
                  <path stroke="var(--accent-cyan)" strokeWidth="3.5" strokeDasharray={`${jobReadyPct}, 100`} strokeDashoffset={`-${beginnerPct + developingPct}`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  {/* segment industry ready: green */}
                  <path stroke="var(--color-success)" strokeWidth="3.5" strokeDasharray={`${industryReadyPct}, 100`} strokeDashoffset={`-${beginnerPct + developingPct + jobReadyPct}`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div style={styles.donutVal}>
                  <span style={{fontSize: '1.25rem', fontWeight: '800'}}>{totalStudents}</span>
                  <span style={{fontSize: '0.65rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase'}}>Students</span>
                </div>
              </div>
              
              <div style={styles.donutLegend}>
                <div style={styles.donutLegendRow}>
                  <span style={{...styles.donutLegendDot, background: 'var(--color-error)'}}></span>
                  <span style={styles.donutLegendText}>Beginner: {beginnerPct}% ({dist.Beginner})</span>
                </div>
                <div style={styles.donutLegendRow}>
                  <span style={{...styles.donutLegendDot, background: 'var(--color-warning)'}}></span>
                  <span style={styles.donutLegendText}>Developing: {developingPct}% ({dist.Developing})</span>
                </div>
                <div style={styles.donutLegendRow}>
                  <span style={{...styles.donutLegendDot, background: 'var(--accent-cyan)'}}></span>
                  <span style={styles.donutLegendText}>Job Ready: {jobReadyPct}% ({dist['Job Ready']})</span>
                </div>
                <div style={styles.donutLegendRow}>
                  <span style={{...styles.donutLegendDot, background: 'var(--color-success)'}}></span>
                  <span style={styles.donutLegendText}>Industry Ready: {industryReadyPct}% ({dist['Industry Ready']})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Reports List Table */}
        <div className="glass-panel" style={{padding: '2rem', marginBottom: '2.5rem'}}>
          <h3 style={{fontSize: '1.25rem', marginBottom: '1.5rem'}}>Registered Student Reports</h3>
          
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  <th style={styles.th}>Student Name</th>
                  <th style={styles.th}>Email Address</th>
                  <th style={styles.th}>Target job role</th>
                  <th style={styles.th}>Readiness score</th>
                  <th style={styles.th}>Readiness level</th>
                  <th style={styles.th}>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {data.studentReports.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)'}}>No student users registered.</td>
                  </tr>
                ) : (
                  data.studentReports.map(student => (
                    <tr key={student.id} style={styles.trBody}>
                      <td style={styles.td}><strong>{student.full_name || 'Alex Mercer'}</strong></td>
                      <td style={{...styles.td, color: 'var(--color-text-secondary)'}}>{student.email}</td>
                      <td style={styles.td}>{student.target_job_role || <em style={{color: 'var(--color-text-muted)'}}>None</em>}</td>
                      <td style={{...styles.td, fontWeight: '700'}}>{student.readiness_percentage !== null ? `${student.readiness_percentage}%` : '0%'}</td>
                      <td style={styles.td}>
                        <span style={{
                          background: student.readiness_level === 'Industry Ready' ? 'rgba(16, 185, 129, 0.15)' : 
                                      student.readiness_level === 'Job Ready' ? 'rgba(6, 182, 212, 0.15)' : 
                                      student.readiness_level === 'Developing' ? 'rgba(230, 150, 0, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: student.readiness_level === 'Industry Ready' ? 'var(--color-success)' :
                                 student.readiness_level === 'Job Ready' ? '#22d3ee' :
                                 student.readiness_level === 'Developing' ? '#f59e0b' : 'var(--color-error)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>
                          {student.readiness_level || 'Beginner'}
                        </span>
                      </td>
                      <td style={{...styles.td, color: 'var(--color-text-muted)', fontSize: '0.8rem'}}>{new Date(student.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System activity logs audit */}
        <div className="glass-panel" style={{padding: '2rem'}}>
          <h3 style={{fontSize: '1.25rem', marginBottom: '1.5rem'}}>Platform Activity Audit Logs</h3>
          <div style={styles.auditTimeline}>
            {data.recentActivities.length === 0 ? (
              <p style={{color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>No platform actions recorded yet.</p>
            ) : (
              data.recentActivities.map((act, idx) => (
                <div key={idx} style={styles.timelineItem}>
                  <div style={styles.timelineMarker}></div>
                  <div style={styles.timelineContent}>
                    <div style={styles.timelineHeader}>
                      <span style={{fontWeight: '700'}}>{act.full_name}</span>
                      <span style={{
                        background: act.type === 'Assessment' ? 'rgba(16,185,129,0.15)' :
                                    act.type === 'Interview' ? 'rgba(99,102,241,0.15)' : 'rgba(6,182,212,0.15)',
                        color: act.type === 'Assessment' ? 'var(--color-success)' :
                               act.type === 'Interview' ? '#a5b4fc' : '#a5f3fc',
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontWeight: '700'
                      }}>{act.type}</span>
                    </div>
                    <div style={{fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem'}}>
                      Action evaluated with score: <strong>{act.score}%</strong>
                    </div>
                    <div style={{fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem'}}>
                      {new Date(act.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  loadingContainer: {
    minHeight: 'calc(100vh - 70px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--border-glass)',
  },
  adminIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(6, 182, 212, 0.15)',
    color: 'var(--accent-cyan)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarBtn: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'inherit',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--color-error)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'var(--transition-fast)',
  },
  welcomeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2.5rem',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    padding: '1.5rem',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statMeta: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: '1.75rem',
    fontWeight: '800',
    fontFamily: 'var(--font-display)',
  },
  barChartContainer: {
    marginTop: '1rem',
  },
  chartSvg: {
    width: '100%',
    height: 'auto',
  },
  chartText: {
    fontSize: '9px',
    fontFamily: 'monospace',
  },
  barText: {
    fontSize: '9px',
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  donutLayout: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: '1.5rem',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  donutContainer: {
    position: 'relative',
    width: '100px',
    height: '100px',
  },
  donutSvg: {
    width: '100%',
    height: '100%',
  },
  donutVal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1.2',
  },
  donutLegend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  donutLegendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  donutLegendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  donutLegendText: {
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  trHead: {
    borderBottom: '2px solid var(--border-glass)',
  },
  th: {
    padding: '0.85rem 1rem',
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  trBody: {
    borderBottom: '1px solid var(--border-glass)',
    transition: 'var(--transition-fast)',
  },
  td: {
    padding: '1rem',
    fontSize: '0.9rem',
  },
  auditTimeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    paddingLeft: '1rem',
    borderLeft: '2px solid var(--border-glass)',
  },
  timelineItem: {
    display: 'flex',
    gap: '1rem',
    position: 'relative',
  },
  timelineMarker: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--accent-cyan)',
    marginTop: '0.35rem',
    left: '-15px',
    position: 'absolute',
    boxShadow: '0 0 6px var(--accent-cyan-glow)',
  },
  timelineContent: {
    width: '100%',
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
  }
};
export default AdminDashboard;
