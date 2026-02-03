import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'up' | 'down' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl transition-all duration-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'font-semibold',
        {
          'bg-gradient-to-r from-primary to-purple-600 text-primary-foreground hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]':
            variant === 'default',
          'bg-gradient-to-r from-success to-emerald-600 text-success-foreground hover:shadow-lg hover:shadow-success/30 hover:scale-[1.02] active:scale-[0.98]':
            variant === 'up',
          'bg-gradient-to-r from-danger to-rose-600 text-danger-foreground hover:shadow-lg hover:shadow-danger/30 hover:scale-[1.02] active:scale-[0.98]':
            variant === 'down',
          'border-2 border-primary/50 bg-transparent text-foreground hover:bg-primary/10 hover:border-primary':
            variant === 'outline',
          'bg-transparent hover:bg-accent/50': variant === 'ghost',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-5 py-2.5': size === 'md',
          'px-8 py-4 text-lg': size === 'lg',
          'h-10 w-10 p-0': size === 'icon',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
