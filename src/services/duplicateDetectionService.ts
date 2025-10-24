import { supabase } from './supabaseService';
import { 
  checkDuplicatePatient, 
  checkDuplicateUser, 
  checkDuplicateAppointment,
  checkDuplicateMedicalRecord,
  DuplicateCheckResult 
} from '../utils/duplicateDetection';
import { Patient, User, Appointment, MedicalRecord } from '../types';

/**
 * Service layer for duplicate detection operations
 */
export const duplicateDetectionService = {
  /**
   * Check for duplicate patients in the database
   */
  async checkDuplicatePatient(newPatient: Partial<Patient>): Promise<DuplicateCheckResult> {
    try {
      const { data: existingPatients, error } = await supabase
        .from('patients')
        .select('*');

      if (error) {
        throw error;
      }

      return checkDuplicatePatient(newPatient, existingPatients || []);
    } catch (error) {
      console.error('Error checking for duplicate patients:', error);
      return {
        isDuplicate: false,
        duplicateType: null,
        existingItem: null,
        message: 'Unable to check for duplicates. Please try again.',
        suggestions: []
      };
    }
  },

  /**
   * Check for duplicate users in the database
   */
  async checkDuplicateUser(newUser: Partial<User>): Promise<DuplicateCheckResult> {
    try {
      const { data: existingUsers, error } = await supabase
        .from('users')
        .select('*');

      if (error) {
        throw error;
      }

      return checkDuplicateUser(newUser, existingUsers || []);
    } catch (error) {
      console.error('Error checking for duplicate users:', error);
      return {
        isDuplicate: false,
        duplicateType: null,
        existingItem: null,
        message: 'Unable to check for duplicates. Please try again.',
        suggestions: []
      };
    }
  },

  /**
   * Check for duplicate appointments in the database
   */
  async checkDuplicateAppointment(newAppointment: Partial<Appointment>): Promise<DuplicateCheckResult> {
    try {
      const { data: existingAppointments, error } = await supabase
        .from('appointments')
        .select('*');

      if (error) {
        throw error;
      }

      return checkDuplicateAppointment(newAppointment, existingAppointments || []);
    } catch (error) {
      console.error('Error checking for duplicate appointments:', error);
      return {
        isDuplicate: false,
        duplicateType: null,
        existingItem: null,
        message: 'Unable to check for duplicates. Please try again.',
        suggestions: []
      };
    }
  },

  /**
   * Check for duplicate medical records in the database
   */
  async checkDuplicateMedicalRecord(newRecord: Partial<MedicalRecord>): Promise<DuplicateCheckResult> {
    try {
      const { data: existingRecords, error } = await supabase
        .from('medical_records')
        .select('*');

      if (error) {
        throw error;
      }

      return checkDuplicateMedicalRecord(newRecord, existingRecords || []);
    } catch (error) {
      console.error('Error checking for duplicate medical records:', error);
      return {
        isDuplicate: false,
        duplicateType: null,
        existingItem: null,
        message: 'Unable to check for duplicates. Please try again.',
        suggestions: []
      };
    }
  },

  /**
   * Get existing patient by phone number
   */
  async getPatientByPhone(phone: string): Promise<Patient | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting patient by phone:', error);
      return null;
    }
  },

  /**
   * Get existing patient by insurance membership number
   */
  async getPatientByInsurance(membershipNumber: string, provider: string): Promise<Patient | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('insurance_info->>membershipNumber', membershipNumber)
        .eq('insurance_info->>provider', provider)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting patient by insurance:', error);
      return null;
    }
  },

  /**
   * Get existing user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  },

  /**
   * Get similar patients by name (fuzzy matching)
   */
  async getSimilarPatients(firstName: string, lastName: string): Promise<Patient[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .ilike('first_name', `%${firstName}%`)
        .ilike('last_name', `%${lastName}%`);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting similar patients:', error);
      return [];
    }
  },

  /**
   * Validate patient uniqueness before registration
   */
  async validatePatientUniqueness(patientData: Partial<Patient>): Promise<{
    isValid: boolean;
    duplicates: DuplicateCheckResult[];
    warnings: string[];
  }> {
    const duplicates: DuplicateCheckResult[] = [];
    const warnings: string[] = [];

    try {
      // Check for exact name match
      const nameCheck = await this.checkDuplicatePatient(patientData);
      if (nameCheck.isDuplicate) {
        duplicates.push(nameCheck);
      }

      // Check for phone number match
      if (patientData.phone) {
        const existingByPhone = await this.getPatientByPhone(patientData.phone);
        if (existingByPhone) {
          duplicates.push({
            isDuplicate: true,
            duplicateType: 'patient',
            existingItem: existingByPhone,
            message: `Patient with phone number "${patientData.phone}" already exists (MRN: ${existingByPhone.mrn})`,
            suggestions: [existingByPhone]
          });
        }
      }

      // Check for insurance membership match
      if (patientData.insuranceInfo?.membershipNumber && patientData.insuranceInfo?.provider) {
        const existingByInsurance = await this.getPatientByInsurance(
          patientData.insuranceInfo.membershipNumber,
          patientData.insuranceInfo.provider
        );
        if (existingByInsurance) {
          duplicates.push({
            isDuplicate: true,
            duplicateType: 'patient',
            existingItem: existingByInsurance,
            message: `Patient with ${patientData.insuranceInfo.provider} membership number "${patientData.insuranceInfo.membershipNumber}" already exists (MRN: ${existingByInsurance.mrn})`,
            suggestions: [existingByInsurance]
          });
        }
      }

      // Check for similar names
      if (patientData.firstName && patientData.lastName) {
        const similarPatients = await this.getSimilarPatients(patientData.firstName, patientData.lastName);
        if (similarPatients.length > 0) {
          warnings.push(`Found ${similarPatients.length} patients with similar names. Please verify this is a new patient.`);
        }
      }

      return {
        isValid: duplicates.length === 0,
        duplicates,
        warnings
      };
    } catch (error) {
      console.error('Error validating patient uniqueness:', error);
      return {
        isValid: false,
        duplicates: [],
        warnings: ['Unable to validate patient uniqueness. Please try again.']
      };
    }
  }
};
