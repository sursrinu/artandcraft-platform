import { useState, useCallback } from 'react';
import { validateField, ValidationRules } from '../utils/validation';

interface UseFormState {
  [key: string]: any;
}

interface UseFormOptions {
  onSubmit: (data: UseFormState) => Promise<void>;
  initialValues?: UseFormState;
  validationRules?: ValidationRules;
}

export const useForm = (options: UseFormOptions) => {
  const [formData, setFormDataInternal] = useState<UseFormState>(options.initialValues || {});
  const [errors, setErrors] = useState<UseFormState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [touched, setTouched] = useState<UseFormState>({});

  // Memoized setFormData wrapper
  const setFormData = useCallback((data: any) => {
    setFormDataInternal(data);
  }, []);

  const validateFieldValue = useCallback((name: string, value: any) => {
    if (!options.validationRules || !options.validationRules[name]) {
      return undefined;
    }
    return validateField(name, value, options.validationRules[name]);
  }, [options.validationRules]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as any;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormDataInternal((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateFieldValue(name, finalValue);
    if (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [validateFieldValue]);

  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateFieldValue(name, formData[name]);
    if (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  }, [formData, validateFieldValue]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: UseFormState = {};
    if (options.validationRules) {
      Object.keys(options.validationRules).forEach((fieldName) => {
        const error = validateFieldValue(fieldName, formData[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);
    try {
      await options.onSubmit(formData);
      setSubmitSuccess(true);
      setFormDataInternal(options.initialValues || {});
      setTouched({});
      setErrors({});
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setErrors({
        form: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, options, validateFieldValue]);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  const setFormValue = useCallback((field: string, value: any) => {
    setFormDataInternal((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormDataInternal(options.initialValues || {});
    setErrors({});
    setTouched({});
    setSubmitSuccess(false);
  }, [options.initialValues]);

  return {
    formData,
    errors,
    isSubmitting,
    submitSuccess,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldError,
    setFormValue,
    setFormData,
    resetForm,
  };
};

export default useForm;
