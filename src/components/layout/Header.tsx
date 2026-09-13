import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Search,
    Sun,
    Moon,
    RefreshCw,
    Minimize2,
    Globe,
    Check,
    ChevronDown,
    ExternalLink
} from 'lucide-react';
import { useConfigStore } from '../../stores/useConfigStore';
import { useAccountStore } from '../../stores/useAccountStore';
import { useViewStore } from '../../stores/useViewStore';
import { showToast } from '../common/ToastContainer';
import { isLinux } from '../../utils/env';
import { cn } from '../../utils/cn';

export const Header: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { config, saveConfig } = useConfigStore();
    const { currentAccount, accounts, switchAccount, fetchAccounts, fetchCurrentAccount } = useAccountStore();
    const { setMiniView } = useViewStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

    const accountDropdownRef = useRef<HTMLDivElement>(null);
    const langDropdownRef = useRef<HTMLDivElement>(null);

    const isProxyRunning = config?.proxy?.enabled ?? false;
    const proxyPort = config?.proxy?.port ?? 8080;

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
                setIsAccountDropdownOpen(false);
            }
            if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
                setIsLangDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Global refresh
    const handleGlobalRefresh = async () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        try {
            await Promise.all([fetchAccounts(), fetchCurrentAccount()]);
            showToast(t('dashboard.toast.refresh_success', 'Quotas refreshed successfully'), 'success');
        } catch (err) {
            console.error('Refresh error:', err);
            showToast(t('dashboard.toast.refresh_error', 'Failed to refresh quotas'), 'error');
        } finally {
            setTimeout(() => setIsRefreshing(false), 600);
        }
    };

    // Theme toggle with View Transition
    const toggleTheme = async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!config) return;
        const newTheme = config.theme === 'light' ? 'dark' : 'light';

        if ('startViewTransition' in document && !isLinux()) {
            const x = event.clientX;
            const y = event.clientY;
            const endRadius = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            );

            // @ts-ignore
            const transition = document.startViewTransition(async () => {
                await saveConfig({
                    ...config,
                    theme: newTheme,
                    language: config.language,
                }, true);
            });

            transition.ready.then(() => {
                const isDarkMode = newTheme === 'dark';
                const clipPath = isDarkMode
                    ? [`circle(${endRadius}px at ${x}px ${y}px)`, `circle(0px at ${x}px ${y}px)`]
                    : [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];

                document.documentElement.animate(
                    { clipPath },
                    {
                        duration: 400,
                        easing: 'ease-in-out',
                        fill: 'forwards',
                        pseudoElement: isDarkMode
                            ? '::view-transition-old(root)'
                            : '::view-transition-new(root)',
                    }
                );
            });
        } else {
            await saveConfig({
                ...config,
                theme: newTheme,
                language: config.language,
            }, true);
        }
    };

    // Language change
    const handleLanguageChange = async (langCode: string) => {
        if (!config) return;
        await saveConfig({
            ...config,
            language: langCode,
            theme: config.theme,
        }, true);
        i18n.changeLanguage(langCode);
        setIsLangDropdownOpen(false);
    };

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'zh', label: '简体中文' },
        { code: 'zh-TW', label: '繁體中文' },
        { code: 'ja', label: '日本語' },
        { code: 'ar', label: 'العربية' },
    ];

    return (
        <header className="h-16 bg-white dark:bg-[#121214] border-b border-slate-200/80 dark:border-zinc-800 px-6 flex items-center justify-between shrink-0 transition-colors z-20">
            {/* Search input with ⌘K */}
            <div className="relative w-72 lg:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                            navigate(`/accounts?q=${encodeURIComponent(searchQuery.trim())}`);
                        }
                    }}
                    placeholder={t('common.search_placeholder', 'Search accounts, models...')}
                    className="w-full pl-10 pr-12 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-150"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded select-none">
                    ⌘K
                </kbd>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2.5">
                {/* Proxy Status Pill */}
                <button
                    onClick={() => navigate('/api-proxy')}
                    className={cn(
                        'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none',
                        isProxyRunning
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
                    )}
                    title="Click to manage Proxy"
                >
                    <span
                        className={cn(
                            'w-2 h-2 rounded-full',
                            isProxyRunning ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-zinc-600'
                        )}
                    />
                    <span>{isProxyRunning ? `Proxy :${proxyPort}` : 'Proxy Inactive'}</span>
                </button>

                {/* Refresh Quotas */}
                <button
                    onClick={handleGlobalRefresh}
                    disabled={isRefreshing}
                    className="w-9 h-9 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center justify-center transition shadow-sm disabled:opacity-50"
                    title={t('dashboard.refresh_quota', 'Refresh Quotas')}
                >
                    <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin text-blue-600')} />
                </button>

                {/* Mini View Toggle */}
                <button
                    onClick={() => setMiniView(true)}
                    className="w-9 h-9 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center justify-center transition shadow-sm"
                    title={t('nav.mini_view', 'Mini View')}
                >
                    <Minimize2 className="w-4 h-4" />
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-9 h-9 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center justify-center transition shadow-sm"
                    title="Toggle Theme"
                >
                    {config?.theme === 'dark' ? (
                        <Moon className="w-4 h-4 text-blue-400" />
                    ) : (
                        <Sun className="w-4 h-4 text-amber-500" />
                    )}
                </button>

                {/* Language Selector Dropdown */}
                <div className="relative" ref={langDropdownRef}>
                    <button
                        onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                        className="w-9 h-9 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center justify-center transition shadow-sm"
                        title="Change Language"
                    >
                        <Globe className="w-4 h-4" />
                    </button>

                    {isLangDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl py-1.5 z-50">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={cn(
                                        'w-full px-3.5 py-2 text-xs font-semibold text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800 transition',
                                        config?.language === lang.code
                                            ? 'text-blue-600 dark:text-blue-400 font-bold'
                                            : 'text-slate-700 dark:text-zinc-300'
                                    )}
                                >
                                    <span>{lang.label}</span>
                                    {config?.language === lang.code && <Check className="w-3.5 h-3.5" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="h-5 w-px bg-slate-200 dark:bg-zinc-800 mx-1" />

                {/* Active Account Avatar Dropdown */}
                <div className="relative" ref={accountDropdownRef}>
                    <button
                        onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                        className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition select-none"
                    >
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                            {currentAccount
                                ? (currentAccount.name || currentAccount.email).slice(0, 2).toUpperCase()
                                : 'AI'}
                        </div>
                        <div className="text-left hidden md:block max-w-[130px]">
                            <span className="block text-xs font-bold text-slate-900 dark:text-zinc-100 truncate leading-tight">
                                {currentAccount ? (currentAccount.name || currentAccount.email.split('@')[0]) : 'No Account'}
                            </span>
                            <span className="block text-[10px] font-medium text-slate-400 truncate leading-tight">
                                {currentAccount ? currentAccount.email : 'Click to select'}
                            </span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {isAccountDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 z-50">
                            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Switch Active Account
                                </span>
                            </div>

                            <div className="max-h-56 overflow-y-auto space-y-1">
                                {accounts.map((acc) => {
                                    const isCurrent = currentAccount?.id === acc.id;
                                    return (
                                        <button
                                            key={acc.id}
                                            onClick={async () => {
                                                await switchAccount(acc.id);
                                                setIsAccountDropdownOpen(false);
                                                showToast(t('dashboard.toast.switch_success', 'Account switched'), 'success');
                                            }}
                                            className={cn(
                                                'w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs transition',
                                                isCurrent
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold'
                                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                                            )}
                                        >
                                            <div className="truncate pr-2">
                                                <span className="block truncate font-semibold">
                                                    {acc.name || acc.email.split('@')[0]}
                                                </span>
                                                <span className="block text-[10px] text-slate-400 truncate">
                                                    {acc.email}
                                                </span>
                                            </div>
                                            {isCurrent && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-700/60">
                                <button
                                    onClick={() => {
                                        setIsAccountDropdownOpen(false);
                                        navigate('/accounts');
                                    }}
                                    className="w-full py-1.5 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1"
                                >
                                    <span>Manage All Accounts</span>
                                    <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
