import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'free' | 'reserved' | 'eating' | 'needs_cleaning' | 'new' | 'cooking' | 'ready' | 'amber';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'amber',
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border';

  const variantStyles = {
    free: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    reserved: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    eating: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    needs_cleaning: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    new: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    cooking: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    ready: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  };

  return (
    <span className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
