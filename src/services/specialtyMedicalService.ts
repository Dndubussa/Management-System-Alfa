// Specialty Medical Service for Ophthalmology and Physical Therapy
// This service handles API calls for specialized medical data

import { supabase } from '../config/supabase';

// =============================================
// OPHTHALMOLOGY SERVICE FUNCTIONS
// =============================================

// Get all ophthalmology records
export const getOphthalmologyRecords = async () => {
  try {
    const { data, error } = await supabase
      .from('ophthalmology_records')
      .select('*')
      .order('visit_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching ophthalmology records:', error);
    throw error;
  }
};

// Get ophthalmology record by ID
export const getOphthalmologyRecord = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('ophthalmology_records')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching ophthalmology record:', error);
    throw error;
  }
};

// Create new ophthalmology record
export const createOphthalmologyRecord = async (recordData: any) => {
  try {
    const { data, error } = await supabase
      .from('ophthalmology_records')
      .insert([recordData])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating ophthalmology record:', error);
    throw error;
  }
};

// Update ophthalmology record
export const updateOphthalmologyRecord = async (id: string, recordData: any) => {
  try {
    const { data, error } = await supabase
      .from('ophthalmology_records')
      .update(recordData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating ophthalmology record:', error);
    throw error;
  }
};

// Get visual acuity tests for a patient
export const getVisualAcuityTests = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('visual_acuity_tests')
      .select('*')
      .eq('patient_id', patientId)
      .order('test_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching visual acuity tests:', error);
    throw error;
  }
};

// Create visual acuity test
export const createVisualAcuityTest = async (testData: any) => {
  try {
    const { data, error } = await supabase
      .from('visual_acuity_tests')
      .insert([testData])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating visual acuity test:', error);
    throw error;
  }
};

// Get refraction data for a patient
export const getRefractionData = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('refraction_data')
      .select('*')
      .eq('patient_id', patientId)
      .order('test_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching refraction data:', error);
    throw error;
  }
};

// Create refraction data
export const createRefractionData = async (refractionData: any) => {
  try {
    const { data, error } = await supabase
      .from('refraction_data')
      .insert([refractionData])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating refraction data:', error);
    throw error;
  }
};

// Get intraocular pressure for a patient
export const getIntraocularPressure = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('intraocular_pressure')
      .select('*')
      .eq('patient_id', patientId)
      .order('test_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching intraocular pressure:', error);
    throw error;
  }
};

// Create intraocular pressure record
export const createIntraocularPressure = async (pressureData: any) => {
  try {
    const { data, error } = await supabase
      .from('intraocular_pressure')
      .insert([pressureData])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating intraocular pressure record:', error);
    throw error;
  }
};

// Get ophthalmology findings for a patient
export const getOphthalmologyFindings = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('ophthalmology_findings')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching ophthalmology findings:', error);
    throw error;
  }
};

// Create ophthalmology finding
export const createOphthalmologyFinding = async (findingData: any) => {
  try {
    const { data, error } = await supabase
      .from('ophthalmology_findings')
      .insert([findingData])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating ophthalmology finding:', error);
    throw error;
  }
};

// Get ophthalmology images for a patient
export const getOphthalmologyImages = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('ophthalmology_images')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching ophthalmology images:', error);
    throw error;
  }
};

// Create ophthalmology image
export const createOphthalmologyImage = async (imageData: any) => {
  try {
    const { data, error } = await supabase
      .from('ophthalmology_images')
      .insert([imageData])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating ophthalmology image:', error);
    throw error;
  }
};

// =============================================
// PHYSICAL THERAPY SERVICE FUNCTIONS
// =============================================

// Get all physical therapy records
export const getPhysicalTherapyRecords = async () => {
  try {
    const { data, error } = await supabase
      .from('physical_therapy_records')
      .select('*')
      .order('visit_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching physical therapy records:', error);
    throw error;
  }
};

// Get physical therapy record by ID
export const getPhysicalTherapyRecord = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('physical_therapy_records')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching physical therapy record:', error);
    throw error;
  }
};

// Create new physical therapy record
export const createPhysicalTherapyRecord = async (recordData: any) => {
  try {
    const { data, error } = await supabase
      .from('physical_therapy_records')
      .insert([recordData])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating physical therapy record:', error);
    throw error;
  }
};

// Update physical therapy record
export const updatePhysicalTherapyRecord = async (id: string, recordData: any) => {
  try {
    const { data, error } = await supabase
      .from('physical_therapy_records')
      .update(recordData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating physical therapy record:', error);
    throw error;
  }
};

// Get therapy plans for a patient
export const getTherapyPlans = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('therapy_plans')
      .select('*')
      .eq('patient_id', patientId)
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching therapy plans:', error);
    throw error;
  }
};

// Create therapy plan
export const createTherapyPlan = async (planData: any) => {
  try {
    const { data, error } = await supabase
      .from('therapy_plans')
      .insert([planData])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating therapy plan:', error);
    throw error;
  }
};

// Get therapy sessions for a patient
export const getTherapySessions = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('therapy_sessions')
      .select('*')
      .eq('patient_id', patientId)
      .order('session_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching therapy sessions:', error);
    throw error;
  }
};

// Create therapy session
export const createTherapySession = async (sessionData: any) => {
  try {
    const { data, error } = await supabase
      .from('therapy_sessions')
      .insert([sessionData])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating therapy session:', error);
    throw error;
  }
};

// Get assessment data for a patient
export const getAssessmentData = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('assessment_data')
      .select('*')
      .eq('patient_id', patientId)
      .order('assessment_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching assessment data:', error);
    throw error;
  }
};

// Create assessment data
export const createAssessmentData = async (assessmentData: any) => {
  try {
    const { data, error } = await supabase
      .from('assessment_data')
      .insert([assessmentData])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating assessment data:', error);
    throw error;
  }
};

// Get exercise prescriptions for a patient
export const getExercisePrescriptions = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('exercise_prescriptions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching exercise prescriptions:', error);
    throw error;
  }
};

// Create exercise prescription
export const createExercisePrescription = async (prescriptionData: any) => {
  try {
    const { data, error } = await supabase
      .from('exercise_prescriptions')
      .insert([prescriptionData])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating exercise prescription:', error);
    throw error;
  }
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

// Convert camelCase to snake_case for database
export const convertCamelToSnake = (obj: any) => {
  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    converted[snakeKey] = value;
  }
  return converted;
};

// Convert snake_case to camelCase for frontend
export const convertSnakeToCamel = (obj: any) => {
  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    converted[camelKey] = value;
  }
  return converted;
};
