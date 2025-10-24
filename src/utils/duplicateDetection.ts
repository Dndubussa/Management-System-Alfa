import { Patient, User, Appointment, MedicalRecord } from '../types';

/**
 * Utility functions for detecting duplicates in the system
 */

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateType: 'patient' | 'user' | 'appointment' | 'medical_record' | null;
  existingItem: any;
  message: string;
  suggestions?: any[];
}

/**
 * Check for duplicate patients based on multiple criteria
 */
export const checkDuplicatePatient = (
  newPatient: Partial<Patient>,
  existingPatients: Patient[]
): DuplicateCheckResult => {
  const { firstName, lastName, phone, dateOfBirth, insuranceInfo } = newPatient;

  // Check for exact name match
  const nameMatch = existingPatients.find(p => 
    p.firstName.toLowerCase() === firstName?.toLowerCase() && 
    p.lastName.toLowerCase() === lastName?.toLowerCase()
  );

  if (nameMatch) {
    return {
      isDuplicate: true,
      duplicateType: 'patient',
      existingItem: nameMatch,
      message: `Patient with name "${firstName} ${lastName}" already exists (MRN: ${nameMatch.mrn})`,
      suggestions: [nameMatch]
    };
  }

  // Check for phone number match
  if (phone) {
    const phoneMatch = existingPatients.find(p => p.phone === phone);
    if (phoneMatch) {
      return {
        isDuplicate: true,
        duplicateType: 'patient',
        existingItem: phoneMatch,
        message: `Patient with phone number "${phone}" already exists (MRN: ${phoneMatch.mrn})`,
        suggestions: [phoneMatch]
      };
    }
  }

  // Check for insurance membership number match
  if (insuranceInfo?.membershipNumber) {
    const insuranceMatch = existingPatients.find(p => 
      p.insuranceInfo?.membershipNumber === insuranceInfo.membershipNumber &&
      p.insuranceInfo?.provider === insuranceInfo.provider
    );
    if (insuranceMatch) {
      return {
        isDuplicate: true,
        duplicateType: 'patient',
        existingItem: insuranceMatch,
        message: `Patient with ${insuranceInfo.provider} membership number "${insuranceInfo.membershipNumber}" already exists (MRN: ${insuranceMatch.mrn})`,
        suggestions: [insuranceMatch]
      };
    }
  }

  // Check for similar names (fuzzy matching)
  const similarNames = existingPatients.filter(p => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const newFullName = `${firstName} ${lastName}`.toLowerCase();
    
    // Check if names are very similar (typo detection)
    const similarity = calculateStringSimilarity(fullName, newFullName);
    return similarity > 0.8; // 80% similarity threshold
  });

  if (similarNames.length > 0) {
    return {
      isDuplicate: false,
      duplicateType: null,
      existingItem: null,
      message: `Similar patient names found. Please verify if this is a new patient or an existing one.`,
      suggestions: similarNames
    };
  }

  return {
    isDuplicate: false,
    duplicateType: null,
    existingItem: null,
    message: 'No duplicates found. Safe to proceed with registration.',
    suggestions: []
  };
};

/**
 * Check for duplicate users
 */
export const checkDuplicateUser = (
  newUser: Partial<User>,
  existingUsers: User[]
): DuplicateCheckResult => {
  const { email, name } = newUser;

  // Check for email match
  if (email) {
    const emailMatch = existingUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailMatch) {
      return {
        isDuplicate: true,
        duplicateType: 'user',
        existingItem: emailMatch,
        message: `User with email "${email}" already exists`,
        suggestions: [emailMatch]
      };
    }
  }

  // Check for name match
  if (name) {
    const nameMatch = existingUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (nameMatch) {
      return {
        isDuplicate: true,
        duplicateType: 'user',
        existingItem: nameMatch,
        message: `User with name "${name}" already exists`,
        suggestions: [nameMatch]
      };
    }
  }

  return {
    isDuplicate: false,
    duplicateType: null,
    existingItem: null,
    message: 'No duplicate users found.',
    suggestions: []
  };
};

/**
 * Check for duplicate appointments
 */
export const checkDuplicateAppointment = (
  newAppointment: Partial<Appointment>,
  existingAppointments: Appointment[]
): DuplicateCheckResult => {
  const { patientId, doctorId, dateTime, type } = newAppointment;

  // Check for same patient, doctor, and time
  const duplicateAppointment = existingAppointments.find(apt => 
    apt.patientId === patientId && 
    apt.doctorId === doctorId && 
    apt.dateTime === dateTime &&
    apt.type === type
  );

  if (duplicateAppointment) {
    return {
      isDuplicate: true,
      duplicateType: 'appointment',
      existingItem: duplicateAppointment,
      message: `Appointment already exists for this patient, doctor, and time`,
      suggestions: [duplicateAppointment]
    };
  }

  return {
    isDuplicate: false,
    duplicateType: null,
    existingItem: null,
    message: 'No duplicate appointments found.',
    suggestions: []
  };
};

/**
 * Check for duplicate medical records
 */
export const checkDuplicateMedicalRecord = (
  newRecord: Partial<MedicalRecord>,
  existingRecords: MedicalRecord[]
): DuplicateCheckResult => {
  const { patientId, doctorId, visitDate, diagnosis } = newRecord;

  // Check for same patient, doctor, and visit date
  const duplicateRecord = existingRecords.find(record => 
    record.patientId === patientId && 
    record.doctorId === doctorId && 
    record.visitDate === visitDate
  );

  if (duplicateRecord) {
    return {
      isDuplicate: true,
      duplicateType: 'medical_record',
      existingItem: duplicateRecord,
      message: `Medical record already exists for this patient, doctor, and visit date`,
      suggestions: [duplicateRecord]
    };
  }

  return {
    isDuplicate: false,
    duplicateType: null,
    existingItem: null,
    message: 'No duplicate medical records found.',
    suggestions: []
  };
};

/**
 * Calculate string similarity using Levenshtein distance
 */
const calculateStringSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

/**
 * Calculate Levenshtein distance between two strings
 */
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Format duplicate detection result for display
 */
export const formatDuplicateResult = (result: DuplicateCheckResult): string => {
  if (result.isDuplicate) {
    return `⚠️ ${result.message}`;
  } else if (result.suggestions && result.suggestions.length > 0) {
    return `🔍 ${result.message}`;
  } else {
    return `✅ ${result.message}`;
  }
};

/**
 * Get duplicate detection icon
 */
export const getDuplicateIcon = (result: DuplicateCheckResult): string => {
  if (result.isDuplicate) {
    return '⚠️';
  } else if (result.suggestions && result.suggestions.length > 0) {
    return '🔍';
  } else {
    return '✅';
  }
};
