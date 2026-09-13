import React from 'react';
import { cn } from '../../utils/cn';

export interface RadialGaugeProps {
    percentage: number; // 0 to 100
    label?: string;
    targetText?: string;
    size?: number;
    color?: string;
    className?: string;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
    percentage,
    label = 'Quota Health',
    targetText,
    color = '#2563EB',
    className,
}) => {
    // Clamped percentage
    const validPercent = Math.min(100, Math.max(0, percentage));
    
    // Circumference of semi-circle arc
    // Radius = 40, Arc length = PI * R ≈ 125.66
    const radius = 40;
    const arcLength = Math.PI * radius;
    const strokeDashoffset = arcLength - (arcLength * validPercent) / 100;

    return (
        <div className={cn('flex flex-col items-center justify-center', className)}>
            <div className="relative w-48 h-28 flex items-end justify-center">
                <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
                    {/* Background track */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="currentColor"
                        className="text-slate-100 dark:text-slate-800"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    {/* Active progress */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={arcLength}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                            transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    />
                </svg>

                <div className="absolute bottom-1 text-center">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {validPercent}%
                    </span>
                    <span className="block text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
                        {label}
                    </span>
                </div>
            </div>

            {targetText && (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3 max-w-[200px]">
                    {targetText}
                </p>
            )}
        </div>
    );
};
