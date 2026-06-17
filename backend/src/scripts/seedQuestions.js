import { dbRun, dbGet } from '../db.js';

const mockQuestions = {
  'Python': {
    category: 'Programming Languages',
    questions: [
      { text: 'Which of the following data types is mutable in Python?', options: [{ text: 'Tuple', correct: false }, { text: 'List', correct: true }, { text: 'String', correct: false }, { text: 'Integer', correct: false }], diff: 'beginner' },
      { text: 'What is the output of print(2 ** 3)?', options: [{ text: '6', correct: false }, { text: '8', correct: true }, { text: '9', correct: false }, { text: 'None', correct: false }], diff: 'beginner' },
      { text: 'How do you create a dictionary in Python?', options: [{ text: '{}', correct: true }, { text: '[]', correct: false }, { text: '()', correct: false }, { text: '<>', correct: false }], diff: 'beginner' },
      { text: 'Which keyword is used to handle exceptions?', options: [{ text: 'catch', correct: false }, { text: 'try', correct: true }, { text: 'throw', correct: false }, { text: 'except', correct: false }], diff: 'beginner' },
      { text: 'What does the len() function do?', options: [{ text: 'Returns length', correct: true }, { text: 'Finds max', correct: false }, { text: 'Sorts array', correct: false }, { text: 'Deletes item', correct: false }], diff: 'beginner' },
      { text: 'How do you comment multiple lines?', options: [{ text: '//', correct: false }, { text: '/* */', correct: false }, { text: '""" """', correct: true }, { text: '<!-- -->', correct: false }], diff: 'beginner' },
      { text: 'Which function takes input from user?', options: [{ text: 'get()', correct: false }, { text: 'read()', correct: false }, { text: 'input()', correct: true }, { text: 'scan()', correct: false }], diff: 'beginner' },
      { text: 'What is the correct file extension for Python?', options: [{ text: '.pt', correct: false }, { text: '.py', correct: true }, { text: '.pyt', correct: false }, { text: '.txt', correct: false }], diff: 'beginner' },

      { text: 'What is the Global Interpreter Lock (GIL)?', options: [{ text: 'Memory manager', correct: false }, { text: 'Mutex protecting objects', correct: true }, { text: 'Network protocol', correct: false }, { text: 'Security feature', correct: false }], diff: 'intermediate' },
      { text: 'Which of the following is a Python web framework?', options: [{ text: 'Django', correct: true }, { text: 'React', correct: false }, { text: 'Laravel', correct: false }, { text: 'Spring', correct: false }], diff: 'intermediate' },
      { text: 'How do you copy an object in Python?', options: [{ text: 'obj.copy()', correct: false }, { text: 'copy module', correct: true }, { text: 'clone()', correct: false }, { text: 'dup()', correct: false }], diff: 'intermediate' },
      { text: 'What is a lambda function?', options: [{ text: 'Named function', correct: false }, { text: 'Anonymous function', correct: true }, { text: 'Class method', correct: false }, { text: 'Recursive function', correct: false }], diff: 'intermediate' },
      { text: 'What does *args do?', options: [{ text: 'Keyword args', correct: false }, { text: 'Variable length args', correct: true }, { text: 'Pointers', correct: false }, { text: 'Multiplication', correct: false }], diff: 'intermediate' },
      { text: 'Which method adds an element to the end of a list?', options: [{ text: 'add()', correct: false }, { text: 'push()', correct: false }, { text: 'insert()', correct: false }, { text: 'append()', correct: true }], diff: 'intermediate' },
      { text: 'What is a decorator?', options: [{ text: 'A visual tool', correct: false }, { text: 'Function wrapping another function', correct: true }, { text: 'A class inheritance', correct: false }, { text: 'Syntax sugar for loops', correct: false }], diff: 'intermediate' },
      { text: 'What is the output of [1, 2, 3] * 2?', options: [{ text: '[2, 4, 6]', correct: false }, { text: '[1, 2, 3, 1, 2, 3]', correct: true }, { text: 'Error', correct: false }, { text: '[[1, 2, 3], [1, 2, 3]]', correct: false }], diff: 'intermediate' },

      { text: 'Explain metaclasses in Python.', options: [{ text: 'Classes of classes', correct: true }, { text: 'Subclasses', correct: false }, { text: 'Abstract classes', correct: false }, { text: 'Data classes', correct: false }], diff: 'advanced' },
      { text: 'How does garbage collection work in Python?', options: [{ text: 'Manual freeing', correct: false }, { text: 'Reference counting', correct: true }, { text: 'Mark and sweep only', correct: false }, { text: 'No garbage collection', correct: false }], diff: 'advanced' },
      { text: 'What is asyncio used for?', options: [{ text: 'Multiprocessing', correct: false }, { text: 'Threading', correct: false }, { text: 'Concurrent code using async/await', correct: true }, { text: 'Database querying', correct: false }], diff: 'advanced' },
      { text: 'What are descriptors in Python?', options: [{ text: 'String representations', correct: false }, { text: 'Object attributes with bound behavior', correct: true }, { text: 'File handlers', correct: false }, { text: 'API endpoints', correct: false }], diff: 'advanced' },
    ]
  },
  'AWS': {
    category: 'Cloud & DevOps',
    questions: [
      { text: 'What does EC2 stand for?', options: [{ text: 'Elastic Compute Cloud', correct: true }, { text: 'Electronic Computing Code', correct: false }, { text: 'Elastic Container Cloud', correct: false }, { text: 'None', correct: false }], diff: 'beginner' },
      { text: 'Which AWS service is used for object storage?', options: [{ text: 'EBS', correct: false }, { text: 'RDS', correct: false }, { text: 'S3', correct: true }, { text: 'Glacier', correct: false }], diff: 'beginner' },
      { text: 'What is IAM?', options: [{ text: 'Identity Access Management', correct: true }, { text: 'Internal App Monitor', correct: false }, { text: 'Instance Auto Manager', correct: false }, { text: 'None', correct: false }], diff: 'beginner' },
      { text: 'What is Amazon RDS?', options: [{ text: 'Relational Database Service', correct: true }, { text: 'Random Data Store', correct: false }, { text: 'Remote Desktop Service', correct: false }, { text: 'Real-time Data Stream', correct: false }], diff: 'beginner' },
      { text: 'Which service resolves domain names?', options: [{ text: 'CloudFront', correct: false }, { text: 'Route 53', correct: true }, { text: 'API Gateway', correct: false }, { text: 'VPC', correct: false }], diff: 'beginner' },
      { text: 'What is a Serverless compute service?', options: [{ text: 'EC2', correct: false }, { text: 'AWS Lambda', correct: true }, { text: 'EKS', correct: false }, { text: 'Redshift', correct: false }], diff: 'beginner' },
      { text: 'What is CloudWatch used for?', options: [{ text: 'Monitoring', correct: true }, { text: 'Billing', correct: false }, { text: 'Storage', correct: false }, { text: 'Compute', correct: false }], diff: 'beginner' },
      { text: 'Which is a NoSQL database in AWS?', options: [{ text: 'Aurora', correct: false }, { text: 'DynamoDB', correct: true }, { text: 'Redshift', correct: false }, { text: 'Neptune', correct: false }], diff: 'beginner' },

      { text: 'What is a VPC?', options: [{ text: 'Virtual Private Cloud', correct: true }, { text: 'Visual Processing Center', correct: false }, { text: 'Virtual Public Cloud', correct: false }, { text: 'None', correct: false }], diff: 'intermediate' },
      { text: 'Which of these is a content delivery network (CDN)?', options: [{ text: 'CloudTrail', correct: false }, { text: 'CloudFront', correct: true }, { text: 'S3', correct: false }, { text: 'Route 53', correct: false }], diff: 'intermediate' },
      { text: 'What does AWS CloudTrail do?', options: [{ text: 'Tracks user activity and API usage', correct: true }, { text: 'Monitors resources', correct: false }, { text: 'Deploys code', correct: false }, { text: 'Manages costs', correct: false }], diff: 'intermediate' },
      { text: 'Which load balancer is best for HTTP/HTTPS traffic?', options: [{ text: 'Network Load Balancer', correct: false }, { text: 'Classic Load Balancer', correct: false }, { text: 'Application Load Balancer', correct: true }, { text: 'Gateway Load Balancer', correct: false }], diff: 'intermediate' },
      { text: 'How do you automatically scale EC2 instances?', options: [{ text: 'AWS Auto Scaling', correct: true }, { text: 'Elastic Beanstalk', correct: false }, { text: 'CloudFormation', correct: false }, { text: 'Lambda', correct: false }], diff: 'intermediate' },
      { text: 'Which service helps deploy Infrastructure as Code?', options: [{ text: 'AWS CloudFormation', correct: true }, { text: 'AWS Config', correct: false }, { text: 'AWS Systems Manager', correct: false }, { text: 'AWS OpsWorks', correct: false }], diff: 'intermediate' },
      { text: 'What is Amazon SNS?', options: [{ text: 'Simple Notification Service', correct: true }, { text: 'Simple Network System', correct: false }, { text: 'Secure Node Service', correct: false }, { text: 'Storage Naming Service', correct: false }], diff: 'intermediate' },
      { text: 'What is the purpose of an Internet Gateway in a VPC?', options: [{ text: 'Provide internet access to subnets', correct: true }, { text: 'Block traffic', correct: false }, { text: 'Monitor logs', correct: false }, { text: 'Encrypt data', correct: false }], diff: 'intermediate' },

      { text: 'What is a Transit Gateway?', options: [{ text: 'Connects VPCs and on-premises networks', correct: true }, { text: 'API router', correct: false }, { text: 'CDN edge location', correct: false }, { text: 'NAT gateway replacement', correct: false }], diff: 'advanced' },
      { text: 'How does DynamoDB DAX improve performance?', options: [{ text: 'Provides a caching layer', correct: true }, { text: 'Adds more SSDs', correct: false }, { text: 'Optimizes SQL queries', correct: false }, { text: 'Compresses data', correct: false }], diff: 'advanced' },
      { text: 'What is AWS Shield Advanced?', options: [{ text: 'DDoS protection service', correct: true }, { text: 'IAM upgrade', correct: false }, { text: 'WAF ruleset', correct: false }, { text: 'VPC security group', correct: false }], diff: 'advanced' },
      { text: 'Explain AWS Organizations.', options: [{ text: 'Consolidates billing and policy management', correct: true }, { text: 'HR tool', correct: false }, { text: 'Resource tagging system', correct: false }, { text: 'Machine learning model', correct: false }], diff: 'advanced' },
    ]
  }
};

export const seedDatabase = async () => {
  for (const [skillName, data] of Object.entries(mockQuestions)) {
    
    // Create category
    let category = await dbGet('SELECT * FROM SkillCategories WHERE category_name = ?', [data.category]);
    if (!category) {
      const res = await dbRun('INSERT INTO SkillCategories (category_name) VALUES (?)', [data.category]);
      category = { id: res.id, category_name: data.category };
    }

    // Create skill
    let skill = await dbGet('SELECT * FROM HubSkills WHERE skill_name = ?', [skillName]);
    if (!skill) {
      const res = await dbRun('INSERT INTO HubSkills (category_id, skill_name, description) VALUES (?, ?, ?)', [category.id, skillName, `Master ${skillName} with our AI assessment.`]);
      skill = { id: res.id, skill_name: skillName };
    }

    // Check if questions exist
    const count = await dbGet('SELECT COUNT(*) as count FROM HubQuestions WHERE skill_id = ?', [skill.id]);
    if (count.count === 0) {
      for (const q of data.questions) {
        const res = await dbRun('INSERT INTO HubQuestions (skill_id, question_text, difficulty) VALUES (?, ?, ?)', [skill.id, q.text, q.diff]);
        for (const opt of q.options) {
          await dbRun('INSERT INTO HubOptions (question_id, option_text, is_correct) VALUES (?, ?, ?)', [res.id, opt.text, opt.correct]);
        }
      }
    }
  }
  return { message: 'Seeding completed successfully.' };
};
