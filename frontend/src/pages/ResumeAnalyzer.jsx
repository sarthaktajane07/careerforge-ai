import React, { useState, useEffect } from 'react';
import apiService from '../services/api.js';
import { FileText, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const hist = await apiService.getResumeHistory();
      setHistory(hist);
    } catch (error) {
      console.error('Failed to load resume history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const data = await apiService.analyzeResume(file);
      setResult(data);
      setFile(null);
      await loadHistory();
    } catch (error) {
      alert('Error analyzing resume: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={styles.header}>
        <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={24} color="var(--accent-purple)" /> Resume ATS Analyzer
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Audit your resume against applicant tracking systems (ATS), identify missing skills, and resolve layout defects.</p>
      </div>

      <div className="grid-cols-12">
        {/* Left Side: Upload & Results */}
        <div className="glass-panel span-8" style={{ padding: '2rem' }}>
          {!result ? (
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Upload Resume</h3>
              
              <div 
                style={{
                  ...styles.dropzone,
                  borderColor: dragOver ? 'var(--accent-purple)' : 'var(--border-glass)',
                  background: dragOver ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.02)'
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setFile(e.dataTransfer.files[0]);
                  }
                }}
              >
                <Upload size={48} color="var(--color-text-secondary)" style={{ marginBottom: '1rem' }} />
                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  {file ? file.name : 'Drag and drop your resume file here'}
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  Supports PDF, DOC, DOCX, TXT (Max size 5MB)
                </p>
                
                <input 
                  type="file" 
                  id="resume-file" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                />
                <label htmlFor="resume-file" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                  Browse File
                </label>
              </div>

              {file && (
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Analyzing resume...' : 'Begin ATS Analysis'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={styles.resultHeader}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--accent-purple)' }}>ATS Scoring Complete</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>File: <strong>{result.fileName}</strong></p>
                </div>
                <div style={styles.scoreContainer}>
                  <div style={styles.scoreLabel}>ATS Score</div>
                  <div style={{ ...styles.scoreVal, color: result.atsScore >= 80 ? '#10b981' : '#06b6d4' }}>
                    {result.atsScore}%
                  </div>
                </div>
              </div>

              <div style={styles.resultBlock}>
                <h4 style={styles.blockTitle}>Missing Industry Keywords</h4>
                <div style={styles.tagsContainer}>
                  {result.missingSkills.map((s, idx) => (
                    <span key={idx} style={styles.tag}>{s}</span>
                  ))}
                </div>
              </div>

              <div style={styles.resultGrid}>
                <div className="glass-panel" style={{ ...styles.cardSub, borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <h4 style={{ color: '#ef4444', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlertCircle size={16} /> Layout & Grammar Issues
                  </h4>
                  <ul style={styles.ul}>
                    {result.formattingIssues.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
                <div className="glass-panel" style={{ ...styles.cardSub, borderColor: 'rgba(99, 102, 241, 0.2)' }}>
                  <h4 style={{ color: 'var(--accent-purple)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle size={16} /> Recommended Fixes
                  </h4>
                  <ul style={styles.ul}>
                    {result.suggestedImprovements.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button className="btn btn-primary" onClick={() => setResult(null)}>Analyze New File</button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Upload History */}
        <div className="glass-panel span-4" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} /> Upload History
          </h3>
          
          {historyLoading ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading logs...</p>
          ) : history.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>No past resume uploads. Try uploading your first draft!</p>
          ) : (
            <div style={styles.historyList}>
              {history.map((hist) => (
                <div key={hist.resume_id} style={styles.historyItem}>
                  <div style={styles.historyMeta}>
                    <span style={{ fontWeight: '700' }}>ATS: {hist.ats_score}%</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(hist.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    File: {hist.file_name}
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
  dropzone: {
    border: '2px dashed var(--border-glass)',
    borderRadius: '12px',
    padding: '4rem 2rem',
    textAlign: 'center',
    transition: 'var(--transition-smooth)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
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
    background: 'rgba(6, 182, 212, 0.15)',
    border: '1px solid rgba(6, 182, 212, 0.3)',
    color: '#a5f3fc',
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
export default ResumeAnalyzer;
