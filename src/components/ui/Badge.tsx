import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'purple' | 'cyan';
    size?: 'sm' | 'md';
    dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    (
        {
            className,
            variant = 'neutral',
            size = 'sm',
            dot = false,
            children,
            ...props
        },
        ref
    ) => {
        const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
            primary:
                'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50',
            success:
                'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50',
            warning:
                'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50',
            error:
                'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50',
            neutral:
                'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60',
            purple:
                'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50',
            cyan:
                'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/50',
        };

        const dotStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
            primary: 'bg-blue-500',
            success: 'bg-emerald-500',
            warning: 'bg-amber-500',
            error: 'bg-rose-500',
            neutral: 'bg-slate-400',
            purple: 'bg-purple-500',
            cyan: 'bg-cyan-500',
        };

        const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
            sm: 'px-2 py-0.5 text-[11px] font-semibold rounded-lg gap-1.5',
            md: 'px-2.5 py-1 text-xs font-semibold rounded-xl gap-2',
        };

        return (
            <span
                ref={ref}
                className={cn(
                    'inline-flex items-center font-medium tracking-tight whitespace-nowrap select-none',
                    variantStyles[variant],
                    sizeStyles[size],
                    className
                )}
                {...props}
            >
                {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotStyles[variant])} />}
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';
