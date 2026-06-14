// CareerForge AI - AI Simulation Engine
// Generates detailed, context-aware responses based on user inputs.
// Highly optimized for entrepreneurship and innovation demo presentations.

// Helper to sanitize lists
const listToArray = (str) => {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
};

// 1. Career Assessment Engine
export const generateCareerAssessment = (answers) => {
  const { interest, workStyle, codingExp, designPref } = answers;
  
  let recommendedPaths = [];
  let strengths = [];
  let weaknesses = [];
  let improvementAreas = [];
  let careerSuggestions = [];
  let score = 75; // Starting base score

  // Custom logic based on assessment answers
  if (interest === 'technical') {
    recommendedPaths = ['Software Engineer', 'DevOps Engineer', 'Data Scientist'];
    strengths = ['Analytical thinking', 'Problem solving', 'Systematic approach'];
    weaknesses = ['Communication with non-technical stakeholders', 'UI/UX Design principles'];
    improvementAreas = ['Collaborating on design assets', 'Presenting architectural decisions in business terms'];
    careerSuggestions = ['Focus on backend engineering & systems architectures', 'Learn cloud deployment workflows (AWS/GCP)'];
    score = 85;
  } else if (interest === 'design') {
    recommendedPaths = ['UI/UX Designer', 'Product Designer', 'Frontend Engineer'];
    strengths = ['Visual storytelling', 'Empathy for users', 'Prototyping tools (Figma)'];
    weaknesses = ['System programming', 'Complex database optimization'];
    improvementAreas = ['Understanding developer handoffs', 'Basic JavaScript state management'];
    careerSuggestions = ['Deepen skills in component-driven UI systems', 'Build a visual design portfolio showing user research'];
    score = 82;
  } else if (interest === 'business') {
    recommendedPaths = ['Product Manager', 'IT Consultant', 'Business Analyst'];
    strengths = ['Strategic vision', 'Market research', 'Stakeholder communication'];
    weaknesses = ['Hands-on software development', 'Advanced coding configurations'];
    improvementAreas = ['Technical literacy for developer discussions', 'Data analytics tools (SQL, Tableau)'];
    careerSuggestions = ['Pursue certifications in Agile/Scrum', 'Learn database querying to back decisions with data'];
    score = 78;
  } else {
    // Default fallback
    recommendedPaths = ['Full Stack Developer', 'Technology Consultant', 'Solutions Architect'];
    strengths = ['Adaptability', 'Broad technological overview', 'Logical flow design'];
    weaknesses = ['Niche specialization', 'Deep infrastructure operations'];
    improvementAreas = ['Choosing a primary stack (e.g. MERN or Python)', 'Building complete end-to-end projects'];
    careerSuggestions = ['Participate in collaborative hackathons', 'Focus on building and deploying 3 key projects'];
    score = 75;
  }

  // Adjust score based on coding experience
  if (codingExp === 'advanced') score += 10;
  if (codingExp === 'none') score -= 5;
  
  return {
    recommendedPaths,
    strengths,
    weaknesses,
    improvementAreas,
    careerSuggestions,
    score: Math.min(Math.max(score, 40), 99) // Clamp between 40 and 99
  };
};

// 2. Resume Analyzer Engine
export const analyzeResume = (fullName, skillsString, educationString, resumeText = '') => {
  const skills = listToArray(skillsString.toLowerCase());
  const education = educationString.toLowerCase();
  const text = resumeText.toLowerCase();

  let atsScore = 60;
  let missingSkills = [];
  let formattingIssues = [];
  let suggestedImprovements = [];

  // Skill analysis
  const techKeywords = ['react', 'node', 'express', 'javascript', 'python', 'sql', 'docker', 'git', 'typescript', 'aws'];
  const missingTech = techKeywords.filter(keyword => !skills.includes(keyword) && !text.includes(keyword));
  
  // Scoring
  atsScore += skills.length * 2; // more listed skills, higher score
  if (education.includes('bachelor') || education.includes('b.s.') || education.includes('b.e.') || education.includes('computer')) {
    atsScore += 10;
  }
  if (text.includes('achieved') || text.includes('led') || text.includes('managed') || text.includes('improved')) {
    atsScore += 8; // Action verbs
  } else {
    formattingIssues.push('Lacks strong action verbs (e.g., Led, Developed, Optimized) in project descriptions.');
  }

  // Formatting checks
  if (text.length > 0 && text.length < 500) {
    formattingIssues.push('Resume content is too brief. Expand on projects and work experience.');
    atsScore -= 10;
  }
  if (!text.includes('@') || (!text.includes('phone') && !text.includes('contact') && !text.includes('+'))) {
    formattingIssues.push('Missing critical contact details (Phone number or Email address layout).');
    atsScore -= 5;
  }

  // Assign missing skills
  missingSkills = missingTech.slice(0, 4).map(s => s.toUpperCase());
  if (missingSkills.length === 0) {
    missingSkills = ['SYSTEM DESIGN', 'CI/CD PIPELINES', 'DOCKER'];
  }

  // Suggested improvements
  suggestedImprovements = [
    `Incorporate missing industry standard keywords: ${missingSkills.join(', ')}.`,
    'Quantify accomplishments (e.g., "improved loading speed by 25%" or "built 4 client integrations").',
    'Structure the header with clear sections: Profile Summary, Core Competencies, Experience, Projects, Education.',
    'Keep your resume layout strictly to a single page for early-career applicant review.'
  ];

  const resumeScore = Math.min(Math.max(atsScore, 30), 98); // Clamp between 30 and 98

  return {
    atsScore: resumeScore,
    resumeScore: resumeScore - 2, // Slightly offset
    missingSkills,
    formattingIssues,
    suggestedImprovements
  };
};

// 3. Mock Interview Question Generator
export const generateInterviewQuestions = (jobRole) => {
  const role = jobRole ? jobRole.trim() : 'Software Engineer';
  
  const hrQuestions = [
    { question: 'Tell me about yourself and what motivates your interest in this role.', type: 'hr' },
    { question: 'Describe a challenging project you worked on and how you resolved a major hurdle.', type: 'hr' },
    { question: `Why do you feel you are the ideal fit for a ${role} position, and what are your long-term goals?`, type: 'hr' }
  ];

  let technicalQuestions = [];

  const roleLower = role.toLowerCase();
  if (roleLower.includes('frontend') || roleLower.includes('react') || roleLower.includes('web')) {
    technicalQuestions = [
      { question: 'What is the Virtual DOM in React, and how does React optimize rendering performance?', type: 'technical' },
      { question: 'Explain CSS specificity and how you approach building responsive designs.', type: 'technical' },
      { question: 'How do you handle state management in a large-scale React application?', type: 'technical' }
    ];
  } else if (roleLower.includes('backend') || roleLower.includes('node') || roleLower.includes('database')) {
    technicalQuestions = [
      { question: 'Explain the difference between SQL and NoSQL databases. When would you choose one over the other?', type: 'technical' },
      { question: 'How does the Node.js event loop work under the hood?', type: 'technical' },
      { question: 'Describe standard practices for securing an Express API endpoint from potential vulnerabilities.', type: 'technical' }
    ];
  } else if (roleLower.includes('data') || roleLower.includes('python') || roleLower.includes('analytics')) {
    technicalQuestions = [
      { question: 'Explain the difference between supervised and unsupervised machine learning models.', type: 'technical' },
      { question: 'How do you handle missing or noisy values in a dataset during preprocessing?', type: 'technical' },
      { question: 'Write a SQL query description to find the second-highest salary from an Employee table.', type: 'technical' }
    ];
  } else if (roleLower.includes('designer') || roleLower.includes('ux') || roleLower.includes('ui')) {
    technicalQuestions = [
      { question: 'Walk me through your UX design process from initial wireframing to developer handoff.', type: 'technical' },
      { question: 'What is the importance of visual hierarchy and color psychology in a SaaS dashboard interface?', type: 'technical' },
      { question: 'How do you conduct usability testing and incorporate negative feedback into layouts?', type: 'technical' }
    ];
  } else {
    // Default/General Software Engineer
    technicalQuestions = [
      { question: 'Explain the difference between synchronous and asynchronous code. How does async execution operate in your primary language?', type: 'technical' },
      { question: 'What are the main principles of Object-Oriented Programming (OOP), and how do they differ from functional design?', type: 'technical' },
      { question: 'How do you optimize a search operation over a sorted array? Describe the time complexity.', type: 'technical' }
    ];
  }

  return [...hrQuestions, ...technicalQuestions];
};

// 4. Mock Interview Grader
export const gradeInterviewResponse = (questionText, userResponse) => {
  const response = userResponse ? userResponse.trim() : '';
  const wordCount = response.split(/\s+/).filter(w => w.length > 0).length;

  let score = 50; // baseline
  let feedback = '';

  if (wordCount < 10) {
    score = 30;
    feedback = 'The response is too short. Try to elaborate by structuring your answers (e.g., using the STAR method for behavioral questions).';
  } else {
    // Adjust score based on length and rich keywords
    if (wordCount > 30) score += 15;
    if (wordCount > 60) score += 25;

    // Check for structure words
    const lowerResponse = response.toLowerCase();
    const starKeywords = ['result', 'situation', 'task', 'action', 'solved', 'because', 'impact', 'learned'];
    const technicalKeywords = ['index', 'optimization', 'asynchronous', 'promise', 'query', 'react', 'renders', 'complexity', 'security', 'structure', 'component'];
    
    let matchedKeywordsCount = 0;
    starKeywords.forEach(kw => {
      if (lowerResponse.includes(kw)) matchedKeywordsCount++;
    });
    technicalKeywords.forEach(kw => {
      if (lowerResponse.includes(kw)) matchedKeywordsCount++;
    });

    score += Math.min(matchedKeywordsCount * 4, 20);

    // Dynamic Feedback Creation
    if (score >= 85) {
      feedback = 'Outstanding response! You structured your points logical and incorporated relevant industry concepts. Your explanation shows deep subject knowledge.';
    } else if (score >= 70) {
      feedback = 'Good response. You explained the main concepts clearly. To make this an elite answer, try to quantify the results of your experiences or cite concrete architectural tradeoffs.';
    } else {
      feedback = 'A decent attempt, but lacks specific details. Structure your response around a real-world scenario. Include why this technology or action was selected and what impact it yielded.';
    }
  }

  return {
    score: Math.min(score, 98),
    feedback
  };
};

// 5. Skill Gap Analysis Engine
export const generateSkillGapAnalysis = (currentSkillsString, targetRole) => {
  const currentSkills = listToArray(currentSkillsString.toLowerCase());
  const role = targetRole ? targetRole.trim() : 'Software Engineer';
  const roleLower = role.toLowerCase();

  let targetSkills = [];
  let recommendedTech = [];
  let learningRoadmap = [];
  let certifications = [];
  let skillsScore = 50;

  // Set target profiles
  if (roleLower.includes('frontend') || roleLower.includes('web') || roleLower.includes('react')) {
    targetSkills = ['javascript', 'react', 'typescript', 'css', 'git', 'redux', 'jest', 'next.js'];
    recommendedTech = ['TypeScript', 'Next.js', 'Jest Testing Library', 'Redux Toolkit'];
    learningRoadmap = [
      { step: 'Advance UI State & Hooks', topic: 'React Context, Custom Hooks, Performance optimization', timeline: 'Week 1-3' },
      { step: 'Static & SSR Frameworks', topic: 'Next.js Routing, SSG/SSR APIs, SEO best practices', timeline: 'Week 4-6' },
      { step: 'Testing & Quality', topic: 'Unit testing with Jest and Mock Service Workers', timeline: 'Week 7-9' }
    ];
    certifications = ['Meta Front-End Developer Professional Certificate', 'Vercel React Specialist'];
  } else if (roleLower.includes('backend') || roleLower.includes('node') || roleLower.includes('database')) {
    targetSkills = ['node.js', 'express', 'sql', 'mongodb', 'docker', 'git', 'typescript', 'redis', 'aws'];
    recommendedTech = ['Express.js', 'PostgreSQL', 'Docker Containers', 'Redis Caching'];
    learningRoadmap = [
      { step: 'RESTful API Mastery', topic: 'Advanced express routing, validation, error handling middleware', timeline: 'Week 1-3' },
      { step: 'Databases & Query Optimizations', topic: 'PostgreSQL relational schemas, indexing, and ORM triggers', timeline: 'Week 4-6' },
      { step: 'Deployment & Scaling', topic: 'Containerizing endpoints with Docker and cloud hosting', timeline: 'Week 7-9' }
    ];
    certifications = ['AWS Certified Developer - Associate', 'PostgreSQL Developer Certification'];
  } else if (roleLower.includes('data') || roleLower.includes('python') || roleLower.includes('analytics')) {
    targetSkills = ['python', 'sql', 'pandas', 'machine learning', 'tableau', 'numpy', 'scikit-learn', 'git'];
    recommendedTech = ['Python Pandas', 'Scikit-Learn', 'Tableau Dashboards', 'Apache Spark'];
    learningRoadmap = [
      { step: 'Statistical Analysis & Manipulation', topic: 'Data wrangling using Pandas and NumPy, data cleanses', timeline: 'Week 1-3' },
      { step: 'ML Modelling', topic: 'Supervised regression & classification algorithms, hyperparameter tuning', timeline: 'Week 4-6' },
      { step: 'Data Storytelling', topic: 'Creating interactive dashboard visualizers and business reports', timeline: 'Week 7-9' }
    ];
    certifications = ['Google Data Analytics Professional Certificate', 'Microsoft Certified: Power BI Data Analyst'];
  } else {
    // Default generic Full Stack Developer / Software Engineer
    targetSkills = ['javascript', 'react', 'node.js', 'express', 'sql', 'git', 'docker', 'data structures'];
    recommendedTech = ['React + Node MERN Stack', 'SQL/Relational Databases', 'Docker & Git Workflows'];
    learningRoadmap = [
      { step: 'Frontend-Backend Connectivity', topic: 'Connecting React clients with full validation Express controllers', timeline: 'Week 1-3' },
      { step: 'Data Modeling & Integrity', topic: 'Normalizing databases, handling relations, and transaction logic', timeline: 'Week 4-6' },
      { step: 'Production Architectures', topic: 'CI/CD pipeline hooks, deployment servers, and basic security systems', timeline: 'Week 7-9' }
    ];
    certifications = ['AWS Certified Solutions Architect', 'Meta Full-Stack Developer Certificate'];
  }

  // Calculate skill overlap
  const missingSkills = targetSkills
    .filter(s => !currentSkills.includes(s))
    .map(s => s.toUpperCase());

  const matchedSkillsCount = targetSkills.length - missingSkills.length;
  skillsScore += Math.round((matchedSkillsCount / targetSkills.length) * 45);

  return {
    missingSkills: missingSkills.length > 0 ? missingSkills : ['SYSTEM DESIGN', 'INTEGRATED TESTING', 'CLOUD OPERATIONS'],
    recommendedTech,
    learningRoadmap,
    certifications,
    skillsScore: Math.min(Math.max(skillsScore, 30), 98)
  };
};

// 6. Career Twin Engine (Simulate Scenarios A, B, and C)
export const simulateCareerTwin = (education, currentSkillsString, careerGoal) => {
  const goal = careerGoal ? careerGoal.trim() : 'Software Engineer';
  
  const scenarioA = {
    role: `Junior ${goal}`,
    timeline: '1 - 2 Years',
    salary: '$60,000 - $75,000',
    description: 'Entering the workforce with your current credentials. Progression is organic but slower, focusing strictly on task completion without expansion.',
    milestones: ['Understand existing codebase configurations', 'Implement minor feature requests', 'Debug baseline client feedback']
  };

  const scenarioB = {
    role: `Senior ${goal}`,
    timeline: '2 - 3 Years',
    salary: '$90,000 - $115,000',
    description: 'An optimized path where you aggressively study adjacent technologies, earn cloud certificates, and volunteer to lead core services.',
    milestones: ['Learn Node.js, Express, and Database design (SQL)', 'Earn cloud practitioner credential (AWS/GCP)', 'Establish reusable component libraries for team members']
  };

  const scenarioC = {
    role: `Lead Architect / AI Solutions Lead`,
    timeline: '4 - 5 Years',
    salary: '$140,000 - $190,000',
    description: 'Your maximum potential growth trajectory. You combine coding depth with distributed systems architectures, developer management, and high-impact business strategy.',
    milestones: ['Master System Design concepts (scaling, load balancers, caching)', 'Incorporate artificial intelligence frameworks (LLMs, vector stores)', 'Lead cross-functional engineer teams on product deliveries']
  };

  return {
    scenarioA,
    scenarioB,
    scenarioC
  };
};

// 7. Calculate overall Career Readiness Score
export const calculateReadinessScore = (resume, interview, skills, assessment) => {
  // Formula: 30% Resume, 30% Interview, 20% Skills, 20% Assessment
  const total = (resume * 0.3) + (interview * 0.3) + (skills * 0.2) + (assessment * 0.2);
  const rounded = Math.round(total * 10) / 10; // decimal formatting

  let level = 'Beginner';
  if (rounded >= 85) {
    level = 'Industry Ready';
  } else if (rounded >= 70) {
    level = 'Job Ready';
  } else if (rounded >= 50) {
    level = 'Developing';
  }

  return {
    percentage: rounded,
    level
  };
};

// 8. Voice & Video Interview Analyzer
export const gradeVoiceVideoSession = (questionsAndAnswers, clientMetrics = {}) => {
  let totalTechScore = 0;
  let textAggregated = '';
  
  questionsAndAnswers.forEach(qa => {
    const grading = gradeInterviewResponse(qa.questionText, qa.userAnswer);
    totalTechScore += grading.score;
    textAggregated += ' ' + (qa.userAnswer || '');
  });

  const technicalScore = questionsAndAnswers.length > 0 ? Math.round(totalTechScore / questionsAndAnswers.length) : 50;

  // Analyze filler words in transcribed speech text
  const fillerWords = ['um', 'uh', 'like', 'ah', 'you know', 'basically'];
  let fillerCount = 0;
  const words = textAggregated.toLowerCase().split(/\s+/);
  words.forEach(w => {
    if (fillerWords.includes(w)) fillerCount++;
  });

  // Calculate Speech/Confidence score
  const confidenceScore = clientMetrics.confidenceScore || Math.max(55, Math.min(96, 90 - (fillerCount * 3)));
  
  // Calculate Communication score
  const averageWordCount = questionsAndAnswers.length > 0 ? (words.length / questionsAndAnswers.length) : 0;
  const communicationScore = clientMetrics.communicationScore || Math.min(98, Math.max(40, 60 + Math.round(averageWordCount * 0.4)));

  // Body Language score
  const bodyLanguageScore = clientMetrics.bodyLanguageScore || Math.max(65, Math.min(95, clientMetrics.eyeContactScore || 88));

  // Overall Score (Weighted)
  const overallScore = Math.round(
    (technicalScore * 0.35) + 
    (communicationScore * 0.25) + 
    (confidenceScore * 0.2) + 
    (bodyLanguageScore * 0.2)
  );

  // Generate customized suggestions
  const suggestionsList = [];
  if (fillerCount > 3) {
    suggestionsList.push(`Reduce use of filler words (you used ${fillerCount} instances of um/uh/like). Practice pausing instead of speaking filler words.`);
  } else {
    suggestionsList.push("Great pacing and minimal filler words. Keep focusing on steady articulation.");
  }

  if (bodyLanguageScore < 80) {
    suggestionsList.push("Improve camera framing and eye contact stability. Maintain direct focus on the lens when speaking.");
  } else {
    suggestionsList.push("Strong eye contact and professional facial postures observed during delivery.");
  }

  if (technicalScore < 75) {
    suggestionsList.push("Deepen your technical answers with concrete examples, architectural details, or algorithms standard to your target role.");
  } else {
    suggestionsList.push("Excellent technical coverage. Cite specific real-world tradeoffs in future conversations.");
  }

  return {
    confidenceScore,
    communicationScore,
    technicalScore,
    bodyLanguageScore,
    overallScore,
    suggestions: suggestionsList.join(' | ')
  };
};
