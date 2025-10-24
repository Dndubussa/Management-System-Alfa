// API Configuration
export const getApiUrl = (endpoint: string = '') => {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://alfa-ms-new-main.vercel.app/api'
    : 'http://localhost:3001/api';
  
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
