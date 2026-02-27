import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  border?: boolean;
  shadow?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const paddingClasses = {
  sm: 'p-3',
  md: 'p-6',
  lg: 'p-8',
};

const shadowClasses = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  border = true,
  shadow = 'md',
  hover = false,
}) => {
  return (
    <div
      className={`
        bg-white rounded-lg
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${border ? 'border border-gray-200' : ''}
        ${hover ? 'transition-shadow duration-200 hover:shadow-lg' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
