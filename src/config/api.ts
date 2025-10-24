// API Configuration
export const getApiUrl = (endpoint: string = '') => {
  // Use the backend server for API calls when in development
  // Use the current hostname for API calls in production (Vercel)
  const isDevelopment = import.meta.env.DEV;
  const baseUrl = isDevelopment 
    ? 'http://localhost:3001/api' 
    : `${window.location.origin}/api`;
  
  console.log('🔍 API Configuration:', {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    baseUrl,
    endpoint,
    fullUrl: endpoint ? `${baseUrl}/${endpoint}` : baseUrl,
    timestamp: new Date().toISOString(),
    environment: isDevelopment ? 'development' : 'production'
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