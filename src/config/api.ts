// API Configuration
export const getApiUrl = (endpoint: string = '') => {
  // Force Vercel API for all environments to ensure consistency
  const baseUrl = 'https://alfasystem.vercel.app/api';
  const fullUrl = endpoint ? `${baseUrl}/${endpoint}` : baseUrl;
  
  console.log('🔍 API Configuration (FORCED VERCEL):', {
    hostname: window.location.hostname,
    baseUrl,
    endpoint,
    fullUrl,
    timestamp: new Date().toISOString()
  });
  
  return fullUrl;
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
