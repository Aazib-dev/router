import React from 'react';
import { cn } from '../../utils/cn';

export interface MetricCardProps {
    title: string;
    value: React.ReactNode;
    subtitle?: string;
    delta?: {
        value: string;
        isPositive?: boolean;
        neutral?: boolean;
    };
    icon: React.ReactNode;
    iconBgColor?: 'blue' | 'emerald' | 'purple' | 'amber' | 'cyan' | 'rose';
    className?: string;
    onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    subtitle,
    delta,
    icon,
    iconBgColor = 'blue',
    className,
    onClick,
}) => {
    const iconStyles = {
        blue: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/40',
        emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40',
        purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/40',
        amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40',
        cyan: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200/50 dark:border-cyan-800/40',
        rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/40',
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                'bg-white dark:bg-[#121214] rounded-2xl p-5 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between transition-all duration-200',
                onClick && 'cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700',
                className
            )}
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    {title}
                </span>
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-sm', iconStyles[iconBgColor])}>
                    {icon}
                </div>
            </div>

            <div>
                <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                        {value}
                    </span>
                    {delta && (
                        <span
                            className={cn(
                                'text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1',
                                delta.neutral
                                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                                    : delta.isPositive
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                            )}
                        >
                            {delta.value}
                        </span>
                    )}
                </div>

                {subtitle && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
};
