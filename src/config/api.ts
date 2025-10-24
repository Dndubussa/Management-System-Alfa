// API Configuration
export const getApiUrl = (endpoint: string = '') => {
  // Check if we're running on Vercel (production) or locally
  const isVercel = window.location.hostname.includes('vercel.app') || 
                   window.location.hostname.includes('alfasystem.vercel.app') ||
                   process.env.NODE_ENV === 'production';
  
  const baseUrl = isVercel
    ? '/api'  // Vercel serverless functions
    : 'http://localhost:3001/api';
  
  console.log('🔍 API Configuration:', {
    hostname: window.location.hostname,
    isVercel,
    baseUrl,
    endpoint,
    fullUrl: endpoint ? `${baseUrl}/${endpoint}` : baseUrl
  });
  
  return endpoint ? `${baseUrl}/${endpoint}` : baseUrl;
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: getApiUrl('auth/login'),
  },
  VITAL_SIGNS: getApiUrl('vital-signs'),
  ICD10: {
    SEARCH: getApiUrl('icd10/search'),
    CATEGORIES: getApiUrl('icd10/categories'),
    CHAPTERS: getApiUrl('icd10/chapters'),
    BROWSE: getApiUrl('icd10'),
  },
} as const;
