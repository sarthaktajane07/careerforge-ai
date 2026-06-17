import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import apiService from '../services/api.js';
import { 
  LayoutDashboard, Compass, FileText, HelpCircle, GitMerge, Users, LogOut,
  User, CheckCircle, RefreshCw, Award, Edit3, Save, Target, CheckSquare
} from 'lucide-react';

// Sub-pages imports
import { CareerAssessment } from './CareerAssessment.jsx';
import { ResumeAnalyzer } from './ResumeAnalyzer.jsx';
import { MockInterview } from './MockInterview.jsx';
import { SkillGap } from './SkillGap.jsx';
import { CareerTwin } from './CareerTwin.jsx';
import { SkillAssessmentHub } from './SkillAssessmentHub.jsx';

export const Dashboard = ({ onNavigate }) => {
  const { logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  
  // Profile edit fields
  const [editFields, setEditFields] = useState({
    fullName: '',
    education: '',
    skills: '',
    interests: '',
    careerGoals: '',
    targetJobRole: ''
  });

  const [savingProfile, setSavingProfile] = useState(false);

  // Fetch dashboard and profile metrics
  const loadData = async () => {
    setLoading(true);
    try {
      const dash = await apiService.getDashboardSummary();
      const prof = await apiService.getProfile();
      setDashboardData(dash);
      setProfileData(prof.profile);
      
      if (prof.profile) {
        setEditFields({
          fullName: prof.profile.full_name || '',
          education: prof.profile.education || '',
          skills: prof.profile.skills || '',
          interests: prof.profile.interests || '',
          careerGoals: prof.profile.career_goals || '',
          targetJobRole: prof.profile.target_job_role || ''
        });
      }
    } catch (error) {
      console.error('Failed to load student dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]); // reload data when switching tabs to ensure updates are synchronized

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await apiService.updateProfile(editFields);
      await refreshUser(); // sync globally
      setEditingProfile(false);
      await loadData();
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  const getGaugeColor = (val) => {
    if (val >= 85) return '#10b981'; // green
    if (val >= 70) return '#06b6d4'; // cyan
    if (val >= 50) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  if (loading && !dashboardData) {
    return (
      <div style={styles.loadingContainer}>
        <RefreshCw size={40} className="spin" style={{ color: 'var(--accent-purple)', animation: 'spinSlow 2s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Forging dashboard data...</p>
      </div>
    );
  }

  // Calculate circular stroke offset
  const scorePercent = dashboardData?.readinessScores?.percentage || 0;
  const strokeRadius = 50;
  const circumference = 2 * Math.PI * strokeRadius;
  const strokeOffset = circumference - (scorePercent / 100) * circumference;

  return (
    <div className="dashboard-grid">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div style={styles.sidebarHeader}>
            <div style={styles.userIcon}><User size={20} /></div>
            <div style={styles.userInfo}>
              <div style={{fontWeight: '700', fontSize: '0.95rem'}}>{profileData?.full_name || 'Alex Mercer'}</div>
              <div style={{color: 'var(--color-text-muted)', fontSize: '0.75rem'}}>Student Portal</div>
            </div>
          </div>
          
          <ul className="sidebar-menu">
            <li>
              <button 
                className={`sidebar-item-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
                style={styles.sidebarBtn}
              >
                <LayoutDashboard size={18} /> Overview
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-item-link ${activeTab === 'assessment' ? 'active' : ''}`}
                onClick={() => setActiveTab('assessment')}
                style={styles.sidebarBtn}
              >
                <Compass size={18} /> Career Assessment
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-item-link ${activeTab === 'resume' ? 'active' : ''}`}
                onClick={() => setActiveTab('resume')}
                style={styles.sidebarBtn}
              >
                <FileText size={18} /> Resume Check
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-item-link ${activeTab === 'interview' ? 'active' : ''}`}
                onClick={() => setActiveTab('interview')}
                style={styles.sidebarBtn}
              >
                <HelpCircle size={18} /> Mock Interview
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-item-link ${activeTab === 'skillgap' ? 'active' : ''}`}
                onClick={() => setActiveTab('skillgap')}
                style={styles.sidebarBtn}
              >
                <GitMerge size={18} /> Skill Gap Analysis
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-item-link ${activeTab === 'skillhub' ? 'active' : ''}`}
                onClick={() => setActiveTab('skillhub')}
                style={styles.sidebarBtn}
              >
                <CheckSquare size={18} /> Skill Assessment
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-item-link ${activeTab === 'careertwin' ? 'active' : ''}`}
                onClick={() => setActiveTab('careertwin')}
                style={styles.sidebarBtn}
              >
                <Target size={18} /> Career Twin AI (USP)
              </button>
            </li>
          </ul>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Panel Content */}
      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="animate-fadeIn">
            <div style={styles.welcomeRow}>
              <div>
                <h1 style={{fontSize: '2rem'}}>Welcome Back, {profileData?.full_name || 'Alex Mercer'}!</h1>
                <p style={{color: 'var(--color-text-secondary)'}}>Track your career readiness indices and schedule simulator runs below.</p>
              </div>
              <button className="btn btn-secondary" onClick={loadData} style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                <RefreshCw size={16} /> Sync
              </button>
            </div>

            <div className="grid-cols-12" style={{marginBottom: '2rem'}}>
              {/* Readiness score gauge */}
              <div className="glass-panel span-4 animate-slideInCard delay-100 card-glow-purple" style={styles.gaugeCard}>
                <h3 style={{fontSize: '1.1rem', marginBottom: '1.5rem', textAlign: 'center'}}>Career Readiness Score</h3>
                <div className="gauge-container">
                  <svg width="120" height="120" className="gauge-svg">
                    <defs>
                      <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--accent-purple)" />
                        <stop offset="100%" stopColor={getGaugeColor(scorePercent)} />
                      </linearGradient>
                    </defs>
                    <circle cx="60" cy="60" r="50" className="gauge-bg" style={{strokeWidth: 8}} />
                    <circle 
                      cx="60" 
                      cy="60" 
                      r="50" 
                      className="gauge-fill" 
                      style={{
                        stroke: 'url(#gauge-grad)',
                        strokeWidth: 8,
                        strokeDasharray: circumference,
                        strokeDashoffset: strokeOffset
                      }} 
                    />
                  </svg>
                  <div className="gauge-value" style={{fontSize: '1.5rem'}}>{scorePercent}%</div>
                </div>
                <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
                  <span style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#a5b4fc',
                    padding: '0.3rem 0.85rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '700'
                  }}>
                    Level: {dashboardData?.readinessScores?.level || 'Developing'}
                  </span>
                </div>
              </div>

              {/* Stats breakdown */}
              <div className="glass-panel span-8 animate-slideInCard delay-200" style={styles.breakdownCard}>
                <h3 style={{fontSize: '1.1rem', marginBottom: '1.5rem'}}>Index Metrics Breakdown</h3>
                <div style={styles.metricsList}>
                  <div style={styles.metricItem}>
                    <div style={styles.metricLabel}>
                      <span>Resume Score (30%)</span>
                      <span style={{fontWeight: '700'}}>{dashboardData?.readinessScores?.resume}%</span>
                    </div>
                    <div style={styles.barOuter}>
                      <div style={{...styles.barInner, width: `${dashboardData?.readinessScores?.resume}%`, background: 'var(--accent-purple)'}}></div>
                    </div>
                  </div>
                  <div style={styles.metricItem}>
                    <div style={styles.metricLabel}>
                      <span>Interview Rating (30%)</span>
                      <span style={{fontWeight: '700'}}>{dashboardData?.readinessScores?.interview}%</span>
                    </div>
                    <div style={styles.barOuter}>
                      <div style={{...styles.barInner, width: `${dashboardData?.readinessScores?.interview}%`, background: 'var(--accent-magenta)'}}></div>
                    </div>
                  </div>
                  <div style={styles.metricItem}>
                    <div style={styles.metricLabel}>
                      <span>Skills Assessment (20%)</span>
                      <span style={{fontWeight: '700'}}>{dashboardData?.readinessScores?.skills}%</span>
                    </div>
                    <div style={styles.barOuter}>
                      <div style={{...styles.barInner, width: `${dashboardData?.readinessScores?.skills}%`, background: 'var(--accent-cyan)'}}></div>
                    </div>
                  </div>
                  <div style={styles.metricItem}>
                    <div style={styles.metricLabel}>
                      <span>Career Quiz Index (20%)</span>
                      <span style={{fontWeight: '700'}}>{dashboardData?.readinessScores?.assessment}%</span>
                    </div>
                    <div style={styles.barOuter}>
                      <div style={{...styles.barInner, width: `${dashboardData?.readinessScores?.assessment}%`, background: 'var(--color-success)'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid-cols-12">
              {/* Profile Card / Editor */}
              <div className="glass-panel span-7 animate-slideInCard delay-300" style={{padding: '2rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                  <h3 style={{fontSize: '1.2rem'}}>Professional Profile</h3>
                  {!editingProfile ? (
                    <button className="btn btn-secondary" onClick={() => setEditingProfile(true)} style={styles.editBtn}>
                      <Edit3 size={14} /> Edit Profile
                    </button>
                  ) : (
                    <button className="btn btn-primary" onClick={handleSaveProfile} style={styles.editBtn} disabled={savingProfile}>
                      <Save size={14} /> {savingProfile ? 'Saving...' : 'Save'}
                    </button>
                  )}
                </div>

                {!editingProfile ? (
                  <div style={styles.profileDetails}>
                    <div style={styles.profileRow}>
                      <span style={styles.profileLabel}>Education:</span>
                      <span style={styles.profileVal}>{profileData?.education || <em style={{color: 'var(--color-text-muted)'}}>Not configured</em>}</span>
                    </div>
                    <div style={styles.profileRow}>
                      <span style={styles.profileLabel}>Target Role:</span>
                      <span style={styles.profileVal}><strong>{profileData?.target_job_role || <em style={{color: 'var(--color-text-muted)'}}>Not configured</em>}</strong></span>
                    </div>
                    <div style={styles.profileRow}>
                      <span style={styles.profileLabel}>Current Skills:</span>
                      <span style={styles.profileVal}>{profileData?.skills || <em style={{color: 'var(--color-text-muted)'}}>Not configured</em>}</span>
                    </div>
                    <div style={styles.profileRow}>
                      <span style={styles.profileLabel}>Career Goals:</span>
                      <span style={styles.profileVal}>{profileData?.career_goals || <em style={{color: 'var(--color-text-muted)'}}>Not configured</em>}</span>
                    </div>
                    <div style={styles.profileRow}>
                      <span style={styles.profileLabel}>Interests:</span>
                      <span style={styles.profileVal}>{profileData?.interests || <em style={{color: 'var(--color-text-muted)'}}>Not configured</em>}</span>
                    </div>
                    
                    {/* Completion bar */}
                    <div style={{marginTop: '2rem'}}>
                      <div style={styles.metricLabel}>
                        <span style={{fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)'}}>Profile Completion</span>
                        <span style={{fontWeight: '700'}}>{dashboardData?.profileCompletion}%</span>
                      </div>
                      <div style={{...styles.barOuter, height: '8px'}}>
                        <div style={{...styles.barInner, width: `${dashboardData?.profileCompletion}%`, background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))'}}></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-control" value={editFields.fullName} onChange={(e) => setEditFields({...editFields, fullName: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Target Job Role</label>
                      <input type="text" className="form-control" placeholder="e.g. Software Engineer" value={editFields.targetJobRole} onChange={(e) => setEditFields({...editFields, targetJobRole: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Education Background</label>
                      <input type="text" className="form-control" placeholder="e.g. Senior CS student" value={editFields.education} onChange={(e) => setEditFields({...editFields, education: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Current Skills (comma-separated)</label>
                      <input type="text" className="form-control" placeholder="e.g. React, JavaScript, Python" value={editFields.skills} onChange={(e) => setEditFields({...editFields, skills: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Career Goals</label>
                      <input type="text" className="form-control" placeholder="e.g. Lead Developer in 5 years" value={editFields.careerGoals} onChange={(e) => setEditFields({...editFields, careerGoals: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Interests</label>
                      <input type="text" className="form-control" placeholder="e.g. DevOps, AI, UX Design" value={editFields.interests} onChange={(e) => setEditFields({...editFields, interests: e.target.value})} />
                    </div>
                  </form>
                )}
              </div>

              {/* Recent Activities List */}
              <div className="glass-panel span-5 animate-slideInCard delay-400" style={{padding: '2rem'}}>
                <h3 style={{fontSize: '1.2rem', marginBottom: '1.5rem'}}>Recent Activities</h3>
                <div style={styles.activityList}>
                  {dashboardData?.recentActivities?.length === 0 ? (
                    <p style={{color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem'}}>No activities recorded yet. Get started by taking the assessment or testing your resume!</p>
                  ) : (
                    dashboardData?.recentActivities?.map(activity => (
                      <div key={activity.id} style={styles.activityItem}>
                        <div style={styles.activityMarker}></div>
                        <div style={styles.activityContent}>
                          <div style={styles.activityTitle}>{activity.title}</div>
                          <div style={styles.activityDesc}>{activity.description}</div>
                          <div style={styles.activityTime}>{new Date(activity.date).toLocaleString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* USP Highlight Scenario Box */}
            {dashboardData?.careerTwinReport && (
              <div className="glass-panel animate-fadeInUp delay-500 card-glow-cyan" style={styles.twinSummaryPanel}>
                <h3 style={{fontSize: '1.2rem', color: '#06b6d4', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <Target size={20} /> Career Twin Predictions (LATEST SIMULATION)
                </h3>
                <p style={{fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem'}}>Goal Role: <strong>{dashboardData.careerTwinReport.careerGoal}</strong></p>
                <div style={styles.twinGrid}>
                  <div style={styles.twinCol}>
                    <div style={styles.scenarioLabel}>Scenario A (Current path)</div>
                    <div style={styles.twinTitle}>{dashboardData.careerTwinReport.scenarioA.role}</div>
                    <div style={styles.twinSalary}>{dashboardData.careerTwinReport.scenarioA.salary}</div>
                    <p style={styles.twinDesc}>{dashboardData.careerTwinReport.scenarioA.description}</p>
                  </div>
                  <div style={styles.twinCol}>
                    <div style={styles.scenarioLabel}>Scenario B (Recommended certifications)</div>
                    <div style={{...styles.twinTitle, color: '#6366f1'}}>{dashboardData.careerTwinReport.scenarioB.role}</div>
                    <div style={styles.twinSalary}>{dashboardData.careerTwinReport.scenarioB.salary}</div>
                    <p style={styles.twinDesc}>{dashboardData.careerTwinReport.scenarioB.description}</p>
                  </div>
                  <div style={styles.twinCol}>
                    <div style={styles.scenarioLabel}>Scenario C (Best Possible Growth)</div>
                    <div style={{...styles.twinTitle, color: '#06b6d4'}}>{dashboardData.careerTwinReport.scenarioC.role}</div>
                    <div style={styles.twinSalary}>{dashboardData.careerTwinReport.scenarioC.salary}</div>
                    <p style={styles.twinDesc}>{dashboardData.careerTwinReport.scenarioC.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modular Page Injections */}
        {activeTab === 'assessment' && (
          <CareerAssessment onComplete={() => setActiveTab('overview')} />
        )}
        {activeTab === 'resume' && (
          <ResumeAnalyzer />
        )}
        {activeTab === 'interview' && (
          <MockInterview />
        )}
        {activeTab === 'skillgap' && (
          <SkillGap />
        )}
        {activeTab === 'careertwin' && (
          <CareerTwin />
        )}
        {activeTab === 'skillhub' && (
          <SkillAssessmentHub />
        )}
      </main>
    </div>
  );
};

// CSS-in-JS style configurations for Student Dashboard
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
  userIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(99, 102, 241, 0.15)',
    color: 'var(--accent-purple)',
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
  gaugeCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  breakdownCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  metricsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  metricLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
  },
  barOuter: {
    height: '6px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  barInner: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s ease-out',
  },
  editBtn: {
    padding: '0.4rem 1rem',
    fontSize: '0.8rem',
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  profileRow: {
    display: 'grid',
    gridTemplateColumns: '130px 1fr',
    fontSize: '0.95rem',
    lineHeight: '1.5',
  },
  profileLabel: {
    color: 'var(--color-text-secondary)',
    fontWeight: '600',
  },
  profileVal: {
    color: 'var(--color-text-primary)',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    maxHeight: '320px',
    overflowY: 'auto',
    paddingRight: '0.5rem',
  },
  activityItem: {
    display: 'flex',
    gap: '1rem',
    position: 'relative',
  },
  activityMarker: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'var(--accent-purple)',
    marginTop: '0.35rem',
    flexShrink: 0,
    boxShadow: '0 0 8px var(--accent-purple-glow)',
  },
  activityContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  activityTitle: {
    fontWeight: '700',
    fontSize: '0.9rem',
  },
  activityDesc: {
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
  },
  activityTime: {
    fontSize: '0.7rem',
    color: 'var(--color-text-muted)',
  },
  twinSummaryPanel: {
    padding: '2rem',
    marginTop: '2rem',
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  twinGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  twinCol: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-glass)',
    borderRadius: '8px',
    padding: '1.25rem',
  },
  scenarioLabel: {
    fontSize: '0.7rem',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
    letterSpacing: '0.05em',
  },
  twinTitle: {
    fontWeight: '700',
    fontSize: '1rem',
    marginBottom: '0.25rem',
  },
  twinSalary: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    marginBottom: '0.75rem',
    fontFamily: 'var(--font-display)',
  },
  twinDesc: {
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.5',
  }
};
export default Dashboard;
