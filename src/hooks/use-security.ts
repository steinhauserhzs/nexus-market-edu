import { useState, useCallback } from 'react';
import { validateInput, validateInputServer, checkRateLimit, logSecurityEvent, type ValidationResult, type RateLimitResult } from '@/utils/security';

/**
 * Hook for input validation with both client and server-side checks
 */
export function useInputValidation() {
  const [validationState, setValidationState] = useState<{
    [key: string]: ValidationResult;
  }>({});

  const validateField = useCallback(async (
    fieldName: string, 
    value: string, 
    type: 'text' | 'email' | 'search' | 'html' = 'text',
    serverValidation = false
  ): Promise<ValidationResult> => {
    let result: ValidationResult;
    
    if (serverValidation) {
      result = await validateInputServer(value, type);
    } else {
      result = validateInput(value, type);
    }
    
    setValidationState(prev => ({
      ...prev,
      [fieldName]: result
    }));
    
    return result;
  }, []);

  const clearValidation = useCallback((fieldName?: string) => {
    if (fieldName) {
      setValidationState(prev => {
        const { [fieldName]: _, ...rest } = prev;
        return rest;
      });
    } else {
      setValidationState({});
    }
  }, []);

  const getValidation = useCallback((fieldName: string) => {
    return validationState[fieldName];
  }, [validationState]);

  const isValid = useCallback((fieldName?: string) => {
    if (fieldName) {
      return validationState[fieldName]?.isValid ?? true;
    }
    return Object.values(validationState).every(v => v.isValid);
  }, [validationState]);

  return {
    validateField,
    clearValidation,
    getValidation,
    isValid,
    validationState
  };
}

/**
 * Hook for rate limiting functionality
 */
export function useRateLimit() {
  const [rateLimitState, setRateLimitState] = useState<{
    [key: string]: RateLimitResult;
  }>({});

  const checkLimit = useCallback(async (
    action: string,
    identifier?: string,
    limit?: number,
    window?: number
  ): Promise<RateLimitResult> => {
    try {
      const result = await checkRateLimit(action, identifier, limit, window);
      
      setRateLimitState(prev => ({
        ...prev,
        [action]: result
      }));
      
      return result;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Fail open
      const result = { allowed: true, remaining: limit || 5 };
      setRateLimitState(prev => ({
        ...prev,
        [action]: result
      }));
      return result;
    }
  }, []);

  const isAllowed = useCallback((action: string) => {
    return rateLimitState[action]?.allowed ?? true;
  }, [rateLimitState]);

  const getRemaining = useCallback((action: string) => {
    return rateLimitState[action]?.remaining ?? 0;
  }, [rateLimitState]);

  return {
    checkLimit,
    isAllowed,
    getRemaining,
    rateLimitState
  };
}

/**
 * Hook for security logging
 */
export function useSecurityLogger() {
  const logEvent = useCallback(async (
    action: string,
    details?: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ) => {
    try {
      await logSecurityEvent(action, details, severity);
    } catch (error) {
      console.error('Security logging failed:', error);
    }
  }, []);

  const logAuthAttempt = useCallback(async (
    success: boolean,
    method: string,
    details?: Record<string, any>
  ) => {
    await logEvent(
      success ? 'auth_success' : 'auth_failure',
      { method, ...details },
      success ? 'low' : 'medium'
    );
  }, [logEvent]);

  const logDataAccess = useCallback(async (
    table: string,
    operation: string,
    recordId?: string,
    details?: Record<string, any>
  ) => {
    await logEvent(
      'data_access',
      { table, operation, recordId, ...details },
      'low'
    );
  }, [logEvent]);

  const logSuspiciousActivity = useCallback(async (
    activity: string,
    details?: Record<string, any>
  ) => {
    await logEvent(
      'suspicious_activity',
      { activity, ...details },
      'high'
    );
  }, [logEvent]);

  const logFormSubmission = useCallback(async (
    formName: string,
    success: boolean,
    details?: Record<string, any>
  ) => {
    await logEvent(
      success ? 'form_submit_success' : 'form_submit_failure',
      { formName, ...details },
      success ? 'low' : 'medium'
    );
  }, [logEvent]);

  return {
    logEvent,
    logAuthAttempt,
    logDataAccess,
    logSuspiciousActivity,
    logFormSubmission
  };
}

/**
 * Comprehensive security hook that combines validation, rate limiting, and logging
 */
export function useSecurity() {
  const validation = useInputValidation();
  const rateLimit = useRateLimit();
  const logger = useSecurityLogger();

  const secureFormSubmit = useCallback(async (
    formName: string,
    formData: Record<string, any>,
    submitFn: (data: Record<string, any>) => Promise<any>,
    options?: {
      rateLimit?: { limit?: number; window?: number };
      validateFields?: Record<string, 'text' | 'email' | 'search' | 'html'>;
      serverValidation?: boolean;
    }
  ) => {
    try {
      // Check rate limit
      if (options?.rateLimit) {
        const rateLimitResult = await rateLimit.checkLimit(
          `form_submit_${formName}`,
          undefined,
          options.rateLimit.limit,
          options.rateLimit.window
        );
        
        if (!rateLimitResult.allowed) {
          await logger.logEvent(
            'rate_limit_blocked',
            { formName, remaining: rateLimitResult.remaining },
            'medium'
          );
          throw new Error(`Rate limit exceeded. Try again in a few minutes.`);
        }
      }

      // Validate fields
      if (options?.validateFields) {
        const validationPromises = Object.entries(options.validateFields).map(
          ([fieldName, type]) => validation.validateField(
            fieldName,
            formData[fieldName] || '',
            type,
            options.serverValidation
          )
        );

        const validationResults = await Promise.all(validationPromises);
        const hasErrors = validationResults.some(result => !result.isValid);

        if (hasErrors) {
          await logger.logFormSubmission(formName, false, { 
            error: 'validation_failed',
            fields: Object.keys(options.validateFields)
          });
          throw new Error('Validation failed. Please check your input.');
        }

        // Update form data with sanitized values
        Object.entries(options.validateFields).forEach(([fieldName], index) => {
          const result = validationResults[index];
          if (result.sanitized !== formData[fieldName]) {
            formData[fieldName] = result.sanitized;
          }
        });
      }

      // Submit form
      const result = await submitFn(formData);

      // Log success
      await logger.logFormSubmission(formName, true, { 
        fields: Object.keys(formData)
      });

      return result;

    } catch (error) {
      // Log failure
      await logger.logFormSubmission(formName, false, { 
        error: error instanceof Error ? error.message : 'Unknown error',
        fields: Object.keys(formData)
      });

      throw error;
    }
  }, [validation, rateLimit, logger]);

  return {
    ...validation,
    ...rateLimit,
    ...logger,
    secureFormSubmit
  };
}