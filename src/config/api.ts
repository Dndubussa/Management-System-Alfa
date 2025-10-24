// API Configuration
export const getApiUrl = (endpoint: string = '') => {
  // Use the current hostname for API calls to ensure consistency with deployment
  const baseUrl = `${window.location.origin}/api`;
  
  console.log('🔍 API Configuration:', {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    baseUrl,
    endpoint,
    fullUrl: endpoint ? `${baseUrl}/${endpoint}` : baseUrl,
    timestamp: new Date().toISOString()
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