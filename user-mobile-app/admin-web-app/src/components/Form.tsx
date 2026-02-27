import React from 'react';

interface FormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
  className?: string;
}

export const Form: React.FC<FormProps> = ({ onSubmit, children, className = '' }) => {
  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${className}`}>
      {children}
    </form>
  );
};

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({ children, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
};

interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ children, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
};

interface FormActionsProps {
  children: React.ReactNode;
  layout?: 'horizontal' | 'vertical';
}

export const FormActions: React.FC<FormActionsProps> = ({ children, layout = 'horizontal' }) => {
  return (
    <div
      className={`
        flex gap-3 pt-4
        ${layout === 'vertical' ? 'flex-col' : 'justify-end'}
      `}
    >
      {children}
    </div>
  );
};

export default Form;
