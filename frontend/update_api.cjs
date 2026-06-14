const fs = require('fs');
const path = require('path');

const apiFile = path.join(__dirname, 'src/services/api.js');
let content = fs.readFileSync(apiFile, 'utf8');

// Prepend the API_BASE_URL logic
if (!content.includes('API_BASE_URL')) {
  const insertIndex = content.indexOf('const getHeaders');
  content = content.slice(0, insertIndex) + 
`// The API base URL is empty for relative routing (Vite proxy/same domain),
// but uses VITE_API_URL if hosted separately on Render/Railway.
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

` + content.slice(insertIndex);
}

// Replace fetch('/api/... with fetch(API_BASE_URL + '/api/...
content = content.replace(/fetch\('\/api/g, 'fetch(API_BASE_URL + \'/api');

fs.writeFileSync(apiFile, content);
console.log('Updated api.js successfully!');
