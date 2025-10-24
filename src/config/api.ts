// API Configuration
export const getApiUrl = (endpoint: string = '') => {
  // Temporarily use local backend until Vercel functions are properly deployed
  const baseUrl = 'http://localhost:3001/api';
  
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
