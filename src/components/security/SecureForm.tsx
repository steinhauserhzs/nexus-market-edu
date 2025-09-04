import React, { useState, useCallback, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSecurity } from '@/hooks/use-security';
import { Shield, AlertTriangle } from 'lucide-react';

interface SecureFormProps {
  onSubmit: (data: Record<string, any>) => Promise<void>;
  formName: string;
  children: React.ReactNode;
  rateLimit?: {
    limit?: number;
    window?: number;
  };
  validateFields?: Record<string, 'text' | 'email' | 'search' | 'html'>;
  serverValidation?: boolean;
  className?: string;
}

export const SecureForm: React.FC<SecureFormProps> = ({
  onSubmit,
  formName,
  children,
  rateLimit,
  validateFields,
  serverValidation = false,
  className = ''
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { 
    secureFormSubmit, 
    isAllowed, 
    getRemaining, 
    getValidation,
    logSuspiciousActivity 
  } = useSecurity();

  const handleInputChange = useCallback((name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    
    // Log suspicious patterns
    if (typeof value === 'string') {
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /data:text\/html/i,
        /(union|select|insert|delete|drop|create|alter)\s/i
      ];
      
      const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(value));
      if (hasSuspiciousContent) {
        logSuspiciousActivity('suspicious_form_input', {
          formName,
          fieldName: name,
          pattern: 'potential_injection'
        });
      }
    }
  }, [formName, logSuspiciousActivity]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    
    // Check rate limit status
    if (rateLimit && !isAllowed(`form_submit_${formName}`)) {
      setError(`Rate limit exceeded. ${getRemaining(`form_submit_${formName}`)} attempts remaining.`);
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await secureFormSubmit(
        formName,
        formData,
        onSubmit,
        {
          rateLimit,
          validateFields,
          serverValidation
        }
      );
      
      setSuccess(true);
      setFormData({});
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      
      // Log form submission errors
      if (errorMessage.includes('Rate limit')) {
        logSuspiciousActivity('rate_limit_violation', { formName });
      }
    } finally {
      setLoading(false);
    }
  }, [
    formData, 
    onSubmit, 
    formName, 
    rateLimit, 
    validateFields, 
    serverValidation, 
    secureFormSubmit, 
    isAllowed, 
    getRemaining,
    logSuspiciousActivity
  ]);

  // Helper function to get field validation status
  const getFieldValidation = (fieldName: string) => {
    return getValidation(fieldName);
  };

  // Helper function to check if field has warnings
  const hasFieldWarnings = (fieldName: string) => {
    const validation = getFieldValidation(fieldName);
    return validation?.warnings && validation.warnings.length > 0;
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Security Status Indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Shield className="w-4 h-4 text-green-500" />
        <span>Secure form with validation and rate limiting</span>
      </div>

      {/* Pass form handlers to children */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            onInputChange: handleInputChange,
            formData,
            getFieldValidation,
            hasFieldWarnings,
            disabled: loading
          } as any);
        }
        return child;
      })}

      {/* Rate Limit Warning */}
      {rateLimit && !isAllowed(`form_submit_${formName}`) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Rate limit reached. Please wait before submitting again.
            Remaining attempts: {getRemaining(`form_submit_${formName}`)}
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Warnings */}
      {validateFields && Object.keys(validateFields).some(field => hasFieldWarnings(field)) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some fields have been automatically corrected for security reasons.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Display */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Form submitted successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={loading || (rateLimit && !isAllowed(`form_submit_${formName}`))}
        className="w-full"
      >
        {loading ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
};