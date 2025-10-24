// =====================================================
// FORM VALIDATION UTILITIES
// =====================================================

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate a form against a schema
 */
export const validateForm = (data: Record<string, any>, schema: ValidationSchema): ValidationResult => {
  const errors: Record<string, string> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    const trimmedValue = typeof value === 'string' ? value.trim() : value;

    // Required field validation
    if (rules.required && (!trimmedValue || trimmedValue === '')) {
      errors[field] = rules.message || `${field} is required`;
      continue;
    }

    // Skip other validations if field is empty and not required
    if (!trimmedValue && !rules.required) {
      continue;
    }

    // String length validation
    if (typeof trimmedValue === 'string') {
      if (rules.minLength && trimmedValue.length < rules.minLength) {
        errors[field] = rules.message || `${field} must be at least ${rules.minLength} characters`;
        continue;
      }
      if (rules.maxLength && trimmedValue.length > rules.maxLength) {
        errors[field] = rules.message || `${field} must be no more than ${rules.maxLength} characters`;
        continue;
      }
    }

    // Numeric validation
    if (typeof value === 'number' || !isNaN(Number(value))) {
      const numValue = Number(value);
      if (rules.min !== undefined && numValue < rules.min) {
        errors[field] = rules.message || `${field} must be at least ${rules.min}`;
        continue;
      }
      if (rules.max !== undefined && numValue > rules.max) {
        errors[field] = rules.message || `${field} must be no more than ${rules.max}`;
        continue;
      }
    }

    // Pattern validation
    if (rules.pattern && typeof trimmedValue === 'string' && !rules.pattern.test(trimmedValue)) {
      errors[field] = rules.message || `${field} format is invalid`;
      continue;
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        errors[field] = customError;
        continue;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // Patient validation
  patient: {
    firstName: { required: true, minLength: 2, maxLength: 50 },
    lastName: { required: true, minLength: 2, maxLength: 50 },
    phone: { 
      required: true, 
      pattern: /^[\+]?[0-9\s\-\(\)]{10,15}$/,
      message: 'Please enter a valid phone number'
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    }
  },

  // Vital signs validation
  vitals: {
    temperature: { 
      required: true, 
      min: 30, 
      max: 45,
      message: 'Temperature must be between 30-45°C'
    },
    pulse: { 
      required: true, 
      min: 30, 
      max: 200,
      message: 'Pulse rate must be between 30-200 bpm'
    },
    respiratoryRate: { 
      required: true, 
      min: 5, 
      max: 60,
      message: 'Respiratory rate must be between 5-60/min'
    },
    bloodPressure: {
      required: true,
      pattern: /^\d{2,3}\/\d{2,3}$/,
      message: 'Please enter blood pressure in format: 120/80'
    },
    height: { 
      required: true, 
      min: 30, 
      max: 250,
      message: 'Height must be between 30-250 cm'
    },
    weight: { 
      required: true, 
      min: 1, 
      max: 300,
      message: 'Weight must be between 1-300 kg'
    },
    oxygenSaturation: { 
      required: true, 
      min: 50, 
      max: 100,
      message: 'Oxygen saturation must be between 50-100%'
    },
    muac: { 
      required: false, 
      min: 5, 
      max: 50,
      message: 'MUAC must be between 5-50 cm'
    }
  },

  // Appointment validation
  appointment: {
    patientId: { required: true, message: 'Please select a patient' },
    doctorId: { required: true, message: 'Please select a doctor' },
    dateTime: { required: true, message: 'Please select appointment date and time' },
    type: { required: true, message: 'Please select appointment type' }
  }
};

/**
 * Validate specific field types
 */
export const fieldValidators = {
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address';
  },

  phone: (value: string) => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    return phoneRegex.test(value) ? null : 'Please enter a valid phone number';
  },

  bloodPressure: (value: string) => {
    const bpRegex = /^\d{2,3}\/\d{2,3}$/;
    return bpRegex.test(value) ? null : 'Please enter blood pressure in format: 120/80';
  },

  age: (value: string | number) => {
    const age = Number(value);
    return age >= 0 && age <= 150 ? null : 'Please enter a valid age (0-150)';
  }
};
