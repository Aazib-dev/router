import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'secondary',
            size = 'md',
            isLoading = false,
            icon,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
            primary:
                'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/25 active:scale-[0.98] border border-transparent',
            secondary:
                'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-transparent',
            outline:
                'bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm',
            ghost:
                'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent',
            danger:
                'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/25 active:scale-[0.98] border border-transparent',
            success:
                'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/25 active:scale-[0.98] border border-transparent',
        };

        const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
            xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
            sm: 'px-3 py-1.5 text-xs font-semibold rounded-xl gap-2',
            md: 'px-4 py-2 text-sm font-semibold rounded-xl gap-2',
            lg: 'px-5 py-2.5 text-base font-semibold rounded-2xl gap-2.5',
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none',
                    variantStyles[variant],
                    sizeStyles[size],
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <svg
                        className="animate-spin -ml-0.5 h-4 w-4 text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                ) : (
                    icon
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
