import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    width?: 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    width = 'md',
}) => {
    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const widthStyles = {
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-200"
                onClick={onClose}
            />

            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div
                    className={cn(
                        'w-screen bg-white dark:bg-[#121214] shadow-2xl flex flex-col justify-between border-l border-slate-200/80 dark:border-zinc-800 transition-transform duration-300 ease-in-out',
                        widthStyles[width]
                    )}
                >
                    {/* Header */}
                    <div className="p-6 pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                                {title}
                            </h3>
                            {description && (
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                                    {description}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {children}
                    </div>

                    {/* Footer */}
                    {footer && (
                        <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
