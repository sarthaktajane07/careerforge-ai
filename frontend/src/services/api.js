// Client-side API Service Integrator

// The API base URL is empty for relative routing (Vite proxy/same domain),
// but uses VITE_API_URL if hosted separately on Render/Railway.
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const apiService = {
  // Authentication & Profile
  login: async (email, password) => {
    const res = await fetch(API_BASE_URL + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  register: async (email, password, fullName, role) => {
    const res = await fetch(API_BASE_URL + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  getProfile: async () => {
    const res = await fetch(API_BASE_URL + '/api/auth/profile', {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
    return data;
  },

  updateProfile: async (profileData) => {
    const res = await fetch(API_BASE_URL + '/api/auth/profile', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update profile');
    return data;
  },

  // Career Assessment
  submitAssessment: async (answers) => {
    const res = await fetch(API_BASE_URL + '/api/assessment', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(answers),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit assessment');
    return data;
  },

  getAssessmentHistory: async () => {
    const res = await fetch(API_BASE_URL + '/api/assessment/history', {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch assessment history');
    return data;
  },

  // Resume Analyzer (Requires Multipart form data for uploads)
  analyzeResume: async (file) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('resume', file);

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(API_BASE_URL + '/api/resume/analyze', {
      method: 'POST',
      headers, // Multer requires boundary, so browser handles Content-Type
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to analyze resume');
    return data;
  },

  getResumeHistory: async () => {
    const res = await fetch(API_BASE_URL + '/api/resume/history', {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch resume analysis history');
    return data;
  },

  // AI Mock Interviews
  startInterview: async (jobRole) => {
    const res = await fetch(API_BASE_URL + '/api/interview/start', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ jobRole }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to start interview session');
    return data;
  },

  submitInterviewAnswers: async (interviewId, responses, videoMetrics) => {
    const res = await fetch(API_BASE_URL + '/api/interview/submit', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ interviewId, responses, videoMetrics }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit interview answers');
    return data;
  },

  getInterviewHistory: async () => {
    const res = await fetch(API_BASE_URL + '/api/interview/history', {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch mock interview history');
    return data;
  },

  // Skill Gap Analysis
  analyzeSkillGap: async (currentSkills, targetRole) => {
    const res = await fetch(API_BASE_URL + '/api/skillgap', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ currentSkills, targetRole }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to perform skill gap analysis');
    return data;
  },

  getSkillGapHistory: async () => {
    const res = await fetch(API_BASE_URL + '/api/skillgap/history', {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch skill gap history');
    return data;
  },

  // Career Twin AI
  simulateCareerTwin: async (education, currentSkills, careerGoal) => {
    const res = await fetch(API_BASE_URL + '/api/careertwin', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ education, currentSkills, careerGoal }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to simulate career twin scenarios');
    return data;
  },

  getCareerTwinHistory: async () => {
    const res = await fetch(API_BASE_URL + '/api/careertwin/history', {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch career twin history');
    return data;
  },

  // Dashboard Aggregates
  getDashboardSummary: async () => {
    const res = await fetch(API_BASE_URL + '/api/dashboard/summary', {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch dashboard summary');
    return data;
  },

  // Admin Panel Analytics
  getAdminAnalytics: async () => {
    const res = await fetch(API_BASE_URL + '/api/admin/analytics', {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch admin analytics data');
    return data;
  },
};

export default apiService;
