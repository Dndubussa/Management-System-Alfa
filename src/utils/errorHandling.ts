import { createError } from '../context/ErrorContext';

// Error types for different categories
export enum ErrorType {
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  SYSTEM = 'SYSTEM',
  USER_INPUT = 'USER_INPUT',
  EXTERNAL_API = 'EXTERNAL_API'
}

// Standard error messages
export const ERROR_MESSAGES = {
  NETWORK: {
    CONNECTION_FAILED: 'Unable to connect to the server',
    TIMEOUT: 'Request timed out',
    SERVER_ERROR: 'Server error occurred',
    NO_INTERNET: 'No internet connection'
  },
  DATABASE: {
    CONNECTION_FAILED: 'Database connection failed',
    QUERY_FAILED: 'Database query failed',
    CONSTRAINT_VIOLATION: 'Data constraint violation',
    RECORD_NOT_FOUND: 'Record not found',
    DUPLICATE_ENTRY: 'Duplicate entry exists'
  },
  AUTHENTICATION: {
    LOGIN_FAILED: 'Login failed',
    SESSION_EXPIRED: 'Session expired',
    INVALID_TOKEN: 'Invalid authentication token',
    ACCESS_DENIED: 'Access denied',
    USER_NOT_FOUND: 'User not found'
  },
  VALIDATION: {
    REQUIRED_FIELD: 'Required field is missing',
    INVALID_FORMAT: 'Invalid data format',
    INVALID_VALUE: 'Invalid value provided',
    DATA_TOO_LONG: 'Data exceeds maximum length',
    DATA_TOO_SHORT: 'Data below minimum length'
  },
  PERMISSION: {
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
    ROLE_REQUIRED: 'Specific role required',
    RESOURCE_ACCESS_DENIED: 'Access to resource denied'
  },
  SYSTEM: {
    UNEXPECTED_ERROR: 'Unexpected system error',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
    CONFIGURATION_ERROR: 'System configuration error',
    RESOURCE_EXHAUSTED: 'System resource exhausted'
  },
  USER_INPUT: {
    INVALID_INPUT: 'Invalid user input',
    MISSING_REQUIRED_DATA: 'Required data is missing',
    INVALID_FILE_FORMAT: 'Invalid file format',
    FILE_TOO_LARGE: 'File size too large'
  },
  EXTERNAL_API: {
    API_ERROR: 'External API error',
    RATE_LIMIT_EXCEEDED: 'API rate limit exceeded',
    INVALID_API_KEY: 'Invalid API key',
    SERVICE_DOWN: 'External service is down'
  }
};

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Create standardized error objects
export function createStandardError(
  type: ErrorType,
  messageKey: keyof typeof ERROR_MESSAGES[typeof type],
  context: {
    component?: string;
    action?: string;
    userAction?: string;
    metadata?: Record<string, any>;
  } = {}
) {
  const message = ERROR_MESSAGES[type][messageKey];
  
  return createError(
    `${type} Error`,
    message,
    {
      type: 'error',
      component: context.component,
      action: context.action,
      userAction: context.userAction,
      metadata: {
        errorType: type,
        messageKey,
        ...context.metadata
      }
    }
  );
}

// Handle Supabase errors specifically
export function handleSupabaseError(
  error: any,
  context: {
    component?: string;
    action?: string;
    userAction?: string;
    metadata?: Record<string, any>;
  } = {}
) {
  let errorType = ErrorType.SYSTEM;
  let title = 'Database Error';
  let message = 'An unexpected database error occurred';
  let details = '';

  if (error?.code) {
    switch (error.code) {
      case '23505': // Unique constraint violation
        errorType = ErrorType.DATABASE;
        title = 'Duplicate Entry';
        message = 'This record already exists';
        details = error.message;
        break;
      case '23503': // Foreign key constraint violation
        errorType = ErrorType.DATABASE;
        title = 'Reference Error';
        message = 'Referenced record does not exist';
        details = error.message;
        break;
      case '23502': // Not null constraint violation
        errorType = ErrorType.VALIDATION;
        title = 'Required Field Missing';
        message = 'A required field is missing';
        details = error.message;
        break;
      case '42501': // Insufficient privilege
        errorType = ErrorType.PERMISSION;
        title = 'Permission Denied';
        message = 'You do not have permission to perform this action';
        details = error.message;
        break;
      case 'PGRST116': // Row Level Security violation
        errorType = ErrorType.PERMISSION;
        title = 'Access Denied';
        message = 'Access to this resource is denied';
        details = error.message;
        break;
      default:
        details = error.message || error.toString();
    }
  } else if (error?.message) {
    details = error.message;
    
    if (error.message.includes('Failed to fetch')) {
      errorType = ErrorType.NETWORK;
      title = 'Connection Error';
      message = 'Unable to connect to the server';
    } else if (error.message.includes('401')) {
      errorType = ErrorType.AUTHENTICATION;
      title = 'Authentication Error';
      message = 'Please log in again';
    } else if (error.message.includes('403')) {
      errorType = ErrorType.PERMISSION;
      title = 'Permission Denied';
      message = 'You do not have permission to perform this action';
    } else if (error.message.includes('404')) {
      errorType = ErrorType.DATABASE;
      title = 'Not Found';
      message = 'The requested resource was not found';
    } else if (error.message.includes('500')) {
      errorType = ErrorType.SYSTEM;
      title = 'Server Error';
      message = 'A server error occurred';
    }
  }

  return createError(
    title,
    message,
    {
      type: 'error',
      details,
      component: context.component,
      action: context.action,
      userAction: context.userAction,
      metadata: {
        errorType,
        supabaseError: error,
        ...context.metadata
      }
    }
  );
}

// Handle network errors
export function handleNetworkError(
  error: any,
  context: {
    component?: string;
    action?: string;
    userAction?: string;
    metadata?: Record<string, any>;
  } = {}
) {
  let message = 'Network error occurred';
  let details = '';

  if (error?.message) {
    details = error.message;
    
    if (error.message.includes('Failed to fetch')) {
      message = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.message.includes('timeout')) {
      message = 'Request timed out. Please try again.';
    } else if (error.message.includes('NetworkError')) {
      message = 'Network error. Please check your connection.';
    }
  }

  return createError(
    'Network Error',
    message,
    {
      type: 'error',
      details,
      component: context.component,
      action: context.action,
      userAction: context.userAction,
      metadata: {
        errorType: ErrorType.NETWORK,
        networkError: error,
        ...context.metadata
      }
    }
  );
}

// Handle validation errors
export function handleValidationError(
  field: string,
  message: string,
  context: {
    component?: string;
    action?: string;
    userAction?: string;
    metadata?: Record<string, any>;
  } = {}
) {
  return createError(
    'Validation Error',
    `${field}: ${message}`,
    {
      type: 'error',
      component: context.component,
      action: context.action,
      userAction: context.userAction,
      metadata: {
        errorType: ErrorType.VALIDATION,
        field,
        ...context.metadata
      }
    }
  );
}

// Async error wrapper
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: {
    title: string;
    component?: string;
    action?: string;
    userAction?: string;
    metadata?: Record<string, any>;
  }
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    // Create error object
    const errorInfo = createError(
      context.title,
      errorObj.message,
      {
        type: 'error',
        details: errorObj.stack,
        component: context.component,
        action: context.action,
        userAction: context.userAction,
        metadata: {
          originalError: error,
          ...context.metadata
        }
      }
    );

    // Log to console
    console.error('🚨 Operation failed:', {
      title: context.title,
      error: errorObj,
      context
    });

    // Return null to indicate failure
    return null;
  }
}

// Retry mechanism with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Error logging utility
export function logError(
  error: Error,
  context: {
    component?: string;
    action?: string;
    userAction?: string;
    metadata?: Record<string, any>;
  } = {}
) {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...context
  };

  // Log to console
  console.error('🚨 Error logged:', errorInfo);

  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, or your own logging endpoint
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error tracking service
    // errorTrackingService.captureException(error, context);
  }

  return errorInfo;
}
