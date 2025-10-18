import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ErrorInfo {
  id: string;
  timestamp: Date;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string;
  stack?: string;
  component?: string;
  action?: string;
  userAction?: string;
  resolved?: boolean;
  metadata?: Record<string, any>;
}

interface ErrorContextType {
  errors: ErrorInfo[];
  addError: (error: Omit<ErrorInfo, 'id' | 'timestamp'>) => void;
  removeError: (id: string) => void;
  clearAllErrors: () => void;
  markAsResolved: (id: string) => void;
  getUnresolvedErrors: () => ErrorInfo[];
  getErrorsByType: (type: ErrorInfo['type']) => ErrorInfo[];
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const addError = useCallback((error: Omit<ErrorInfo, 'id' | 'timestamp'>) => {
    const newError: ErrorInfo = {
      ...error,
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    setErrors(prev => {
      // Check if similar error already exists (same title and message)
      const existingError = prev.find(e => 
        e.title === newError.title && 
        e.message === newError.message && 
        !e.resolved
      );
      
      if (existingError) {
        // Update existing error timestamp instead of adding duplicate
        return prev.map(e => 
          e.id === existingError.id 
            ? { ...e, timestamp: new Date(), metadata: { ...e.metadata, count: (e.metadata?.count || 1) + 1 } }
            : e
        );
      }
      
      return [...prev, newError];
    });

    // Log to console for development
    console.error('🚨 System Error:', {
      title: newError.title,
      message: newError.message,
      details: newError.details,
      component: newError.component,
      action: newError.action,
      metadata: newError.metadata
    });
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const markAsResolved = useCallback((id: string) => {
    setErrors(prev => 
      prev.map(error => 
        error.id === id ? { ...error, resolved: true } : error
      )
    );
  }, []);

  const getUnresolvedErrors = useCallback(() => {
    return errors.filter(error => !error.resolved);
  }, [errors]);

  const getErrorsByType = useCallback((type: ErrorInfo['type']) => {
    return errors.filter(error => error.type === type && !error.resolved);
  }, [errors]);

  return (
    <ErrorContext.Provider value={{
      errors,
      addError,
      removeError,
      clearAllErrors,
      markAsResolved,
      getUnresolvedErrors,
      getErrorsByType,
    }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

// Utility function to create standardized error objects
export function createError(
  title: string,
  message: string,
  options: {
    type?: ErrorInfo['type'];
    details?: string;
    component?: string;
    action?: string;
    userAction?: string;
    metadata?: Record<string, any>;
  } = {}
): Omit<ErrorInfo, 'id' | 'timestamp'> {
  return {
    type: options.type || 'error',
    title,
    message,
    details: options.details,
    component: options.component,
    action: options.action,
    userAction: options.userAction,
    metadata: options.metadata,
  };
}

// Utility function to handle async operations with error catching
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorContext: {
    title: string;
    component?: string;
    action?: string;
    userAction?: string;
  }
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      const { addError } = useError();
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = error instanceof Error ? error.stack : undefined;
      
      addError(createError(
        errorContext.title,
        errorMessage,
        {
          details: errorDetails,
          component: errorContext.component,
          action: errorContext.action,
          userAction: errorContext.userAction,
          metadata: { args: args.length > 0 ? args : undefined }
        }
      ));
      
      return null;
    }
  };
}
