import React from 'react';
import { cn } from '../../utils/cn';

export interface TabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    badge?: React.ReactNode;
}

export interface TabsProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (tabId: string) => void;
    variant?: 'pill' | 'underline';
    className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
    tabs,
    activeTab,
    onChange,
    variant = 'pill',
    className,
}) => {
    if (variant === 'underline') {
        return (
            <div className={cn('flex border-b border-slate-200/80 dark:border-slate-800 gap-6', className)}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={cn(
                                'flex items-center gap-2 pb-3.5 pt-1 text-sm font-semibold transition-all relative',
                                isActive
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                            )}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                            {tab.badge}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className={cn('inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl gap-1', className)}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={cn(
                            'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all select-none',
                            isActive
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        )}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {tab.badge}
                    </button>
                );
            })}
        </div>
    );
};
