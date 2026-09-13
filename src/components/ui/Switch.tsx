import React from 'react';
import { cn } from '../../utils/cn';

export interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    size?: 'sm' | 'md';
    className?: string;
    id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
    checked,
    onChange,
    disabled = false,
    size = 'md',
    className,
    id,
}) => {
    const isSm = size === 'sm';

    return (
        <button
            type="button"
            role="switch"
            id={id}
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            className={cn(
                'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50',
                isSm ? 'h-4 w-7' : 'h-6 w-11',
                checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700',
                className
            )}
        >
            <span
                className={cn(
                    'pointer-events-none inline-block transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                    isSm ? 'h-3 w-3 mt-0.5' : 'h-5 w-5 mt-0.5',
                    checked
                        ? isSm ? 'translate-x-3.5 ml-0' : 'translate-x-5 ml-0.5'
                        : isSm ? 'translate-x-0.5' : 'translate-x-0.5'
                )}
            />
        </button>
    );
};
