import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  hoverEffect = true,
  className = '',
  ...props
}) => {
  const baseStyle = 'rounded-3xl p-6 transition-all duration-300 relative overflow-hidden';
  
  const variantStyles = {
    glass: 'bg-dark-900/60 backdrop-blur-md border border-white/10 shadow-xl',
    default: 'bg-dark-900 border border-dark-800 text-white shadow-lg',
    bordered: 'bg-transparent border border-amber-500/30 text-white',
  };

  const hoverStyle = hoverEffect
    ? 'hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10'
    : '';

  return (
    <div className={`${baseStyle} ${variantStyles[variant]} ${hoverStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
