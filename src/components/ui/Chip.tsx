import { HTMLAttributes } from 'react';

type ChipVariant = 'default' | 'success' | 'warning' | 'error';

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
}

const variants: Record<ChipVariant, string> = {
  default: 'bg-slate-200 text-slate-700',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
};

export function Chip({ variant = 'default', className = '', ...props }: ChipProps) {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
        ${variants[variant]}
        ${className}
      `.trim()}
      {...props}
    />
  );
}
