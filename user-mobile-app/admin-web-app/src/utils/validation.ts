/**
 * Form Validation Utilities
 */

export interface ValidationRule {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  custom?: (value: any) => string | undefined;
  email?: boolean;
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  match?: { value: any; message: string };
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

/**
 * Validate a single field
 */
export const validateField = (
  name: string,
  value: any,
  rules: ValidationRule
): string | undefined => {
  // Required validation
  if (rules.required) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return typeof rules.required === 'string' 
        ? rules.required 
        : `${name} is required`;
    }
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return undefined;
  }

  // Email validation
  if (rules.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
  }

  // Min length validation
  if (rules.minLength && typeof value === 'string') {
    if (value.length < rules.minLength.value) {
      return rules.minLength.message;
    }
  }

  // Max length validation
  if (rules.maxLength && typeof value === 'string') {
    if (value.length > rules.maxLength.value) {
      return rules.maxLength.message;
    }
  }

  // Pattern validation
  if (rules.pattern) {
    if (!rules.pattern.value.test(value)) {
      return rules.pattern.message;
    }
  }

  // Min value validation
  if (rules.min !== undefined && typeof value === 'number') {
    if (value < rules.min.value) {
      return rules.min.message;
    }
  }

  // Max value validation
  if (rules.max !== undefined && typeof value === 'number') {
    if (value > rules.max.value) {
      return rules.max.message;
    }
  }

  // Match validation (for confirm password, etc.)
  if (rules.match !== undefined) {
    if (value !== rules.match.value) {
      return rules.match.message;
    }
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return undefined;
};

/**
 * Validate all fields against rules
 */
export const validateForm = (
  data: { [key: string]: any },
  rules: ValidationRules
): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  Object.keys(rules).forEach((fieldName) => {
    const error = validateField(fieldName, data[fieldName], rules[fieldName]);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  creditCard: /^[0-9]{13,19}$/,
};

/**
 * Common validation rules templates
 */
export const CommonRules = {
  email: {
    required: 'Email is required',
    email: true,
  },
  password: {
    required: 'Password is required',
    minLength: { value: 8, message: 'Password must be at least 8 characters' },
    pattern: {
      value: ValidationPatterns.password,
      message: 'Password must contain uppercase, lowercase, number, and special character',
    },
  },
  confirmPassword: (password: string) => ({
    required: 'Please confirm your password',
    match: { value: password, message: 'Passwords do not match' },
  }),
  phone: {
    pattern: {
      value: ValidationPatterns.phone,
      message: 'Please enter a valid phone number',
    },
  },
  url: {
    pattern: {
      value: ValidationPatterns.url,
      message: 'Please enter a valid URL',
    },
  },
  name: {
    required: 'Name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
    maxLength: { value: 100, message: 'Name must not exceed 100 characters' },
  },
  businessName: {
    required: 'Business name is required',
    minLength: { value: 3, message: 'Business name must be at least 3 characters' },
    maxLength: { value: 255, message: 'Business name must not exceed 255 characters' },
  },
  description: {
    minLength: { value: 10, message: 'Description must be at least 10 characters' },
    maxLength: { value: 2000, message: 'Description must not exceed 2000 characters' },
  },
  zipCode: {
    pattern: {
      value: ValidationPatterns.zipCode,
      message: 'Please enter a valid ZIP code',
    },
  },
};
