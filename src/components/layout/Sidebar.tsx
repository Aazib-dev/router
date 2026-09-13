import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Users,
    Network,
    Activity,
    BarChart3,
    Key,
    ShieldCheck,
    Settings,
    Copy,
    ChevronLeft,
    ChevronRight,
    Zap,
    Check
} from 'lucide-react';
import LogoIcon from '../../../src-tauri/icons/icon.png';
import { useAccountStore } from '../../stores/useAccountStore';
import { useConfigStore } from '../../stores/useConfigStore';
import { copyToClipboard } from '../../utils/clipboard';
import { showToast } from '../common/ToastContainer';
import { cn } from '../../utils/cn';

interface SidebarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const { accounts } = useAccountStore();
    const { config, isMenuItemHidden } = useConfigStore();
    const [copiedUrl, setCopiedUrl] = useState(false);

    const isProxyRunning = config?.proxy?.enabled ?? false;
    const proxyPort = config?.proxy?.port ?? 8080;

    const navItems = [
        { path: '/', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
        {
            path: '/accounts',
            label: t('nav.accounts', 'Accounts'),
            icon: Users,
            badge: accounts.length > 0 ? accounts.length : undefined,
            badgeColor: 'emerald'
        },
        {
            path: '/api-proxy',
            label: t('nav.proxy', 'API Proxy'),
            icon: Network,
            dot: isProxyRunning,
        },
        { path: '/monitor', label: t('nav.call_records', 'Live Monitor'), icon: Activity },
        { path: '/token-stats', label: t('nav.token_stats', 'Token Analytics'), icon: BarChart3 },
        { path: '/user-token', label: t('nav.user_token', 'User Tokens'), icon: Key },
        { path: '/security', label: t('nav.security', 'Security & IP'), icon: ShieldCheck },
        { path: '/settings', label: t('nav.settings', 'Settings'), icon: Settings },
    ];

    const visibleItems = navItems.filter(item => !isMenuItemHidden(item.path));

    const handleCopyBaseUrl = async () => {
        const url = `http://127.0.0.1:${proxyPort}/v1`;
        await copyToClipboard(url);
        setCopiedUrl(true);
        showToast(t('proxy.url_copied', 'Proxy URL copied to clipboard'), 'success');
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    return (
        <aside
            className={cn(
                'h-full bg-white dark:bg-[#121214] border-r border-slate-200/80 dark:border-zinc-800 flex flex-col justify-between p-3.5 shrink-0 transition-all duration-300 z-30 select-none relative',
                isCollapsed ? 'w-[72px]' : 'w-64'
            )}
        >
            <div>
                {/* Header / Logo */}
                <div className="flex items-center justify-between px-2 py-2 mb-4">
                    <Link to="/" className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center p-1.5 shrink-0">
                            <img src={LogoIcon} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        {!isCollapsed && (
                            <div className="min-w-0">
                                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-zinc-100 block truncate">
                                    {t('common.app_name', 'Router')}
                                </span>
                                <span className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                    Antigravity
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Collapse Button */}
                    <button
                        onClick={onToggleCollapse}
                        className={cn(
                            'w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors',
                            isCollapsed && 'hidden'
                        )}
                        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                </div>

                {isCollapsed && (
                    <div className="flex justify-center mb-3">
                        <button
                            onClick={onToggleCollapse}
                            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
                            title="Expand Sidebar"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Nav Links */}
                <nav className="space-y-1">
                    {visibleItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                title={isCollapsed ? item.label : undefined}
                                className={cn(
                                    'flex items-center rounded-xl text-sm font-medium transition-all duration-150 relative group',
                                    isCollapsed
                                        ? 'justify-center w-10 h-10 mx-auto'
                                        : 'justify-between px-3 py-2.5',
                                    isActive
                                        ? 'bg-blue-50 dark:bg-zinc-800/90 text-blue-600 dark:text-white font-semibold'
                                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-zinc-800/50 hover:text-slate-900 dark:hover:text-zinc-100'
                                )}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <item.icon
                                        className={cn(
                                            'w-5 h-5 shrink-0 transition-colors',
                                            isActive
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-zinc-200'
                                        )}
                                    />
                                    {!isCollapsed && (
                                        <span className="truncate">{item.label}</span>
                                    )}
                                </div>

                                {!isCollapsed && (
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {item.badge !== undefined && (
                                            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                                                {item.badge}
                                            </span>
                                        )}
                                        {item.dot && (
                                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                        )}
                                    </div>
                                )}

                                {/* Collapsed dot badge */}
                                {isCollapsed && item.dot && (
                                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121214]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Status Card */}
            {!isCollapsed ? (
                <div className="rounded-2xl bg-slate-50 dark:bg-[#18181b] p-4 shadow-sm relative overflow-hidden border border-slate-200/80 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span
                            className={cn(
                                'w-2 h-2 rounded-full',
                                isProxyRunning ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-zinc-600'
                            )}
                        />
                        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-zinc-400">
                            Proxy Gateway
                        </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-0.5">
                        {isProxyRunning ? `Port ${proxyPort} Active` : 'Gateway Idle'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">
                        {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'} available
                    </p>

                    <button
                        onClick={handleCopyBaseUrl}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-blue-600/20 active:scale-[0.98] transition-all"
                    >
                        {copiedUrl ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-300" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Base URL</span>
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div className="flex justify-center">
                    <button
                        onClick={handleCopyBaseUrl}
                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-zinc-700 dark:hover:text-white flex items-center justify-center transition"
                        title="Copy Proxy Base URL"
                    >
                        <Zap className="w-4 h-4 text-blue-500" />
                    </button>
                </div>
            )}
        </aside>
    );
};
