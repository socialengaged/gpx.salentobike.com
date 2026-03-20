import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800',
  secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 active:bg-slate-400',
  outline: 'border-2 border-sky-600 text-sky-600 hover:bg-sky-50 active:bg-sky-100',
  ghost: 'text-sky-600 hover:bg-sky-50 active:bg-sky-100',
};

const sizes: Record<string, string> = {
  sm: 'px-4 py-2.5 text-base min-h-[48px]',
  md: 'px-5 py-3 text-lg min-h-[52px]',
  lg: 'px-6 py-4 text-xl min-h-[56px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className = '', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-colors touch-manipulation
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.trim()}
      {...props}
    />
  )
);

Button.displayName = 'Button';
