import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Lock, FileText, Settings, Activity, RefreshCw } from 'lucide-react';
import { IpAccessLogs } from '../components/security/IpAccessLogs';
import { BlacklistManager } from '../components/security/BlacklistManager';
import { WhitelistManager } from '../components/security/WhitelistManager';
import { SecurityConfig } from '../components/security/SecurityConfig';
import { IpStatistics } from '../components/security/IpStatistics';
import { cn } from '../utils/cn';

const Security: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'logs' | 'stats' | 'blacklist' | 'whitelist' | 'config'>('logs');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'logs':
                return <IpAccessLogs refreshKey={refreshKey} />;
            case 'stats':
                return <IpStatistics refreshKey={refreshKey} />;
            case 'blacklist':
                return <BlacklistManager refreshKey={refreshKey} />;
            case 'whitelist':
                return <WhitelistManager refreshKey={refreshKey} />;
            case 'config':
                return <SecurityConfig />;
            default:
                return <IpAccessLogs refreshKey={refreshKey} />;
        }
    };

    const tabs = [
        { id: 'logs', label: t('security.tab_logs', 'Access Logs'), icon: FileText },
        { id: 'stats', label: t('security.tab_stats', 'IP Analytics'), icon: Activity },
        { id: 'blacklist', label: t('security.tab_blacklist', 'Blacklist'), icon: Shield },
        { id: 'whitelist', label: t('security.tab_whitelist', 'Whitelist'), icon: Lock },
        { id: 'config', label: t('security.tab_config', 'Security Policies'), icon: Settings },
    ];

    return (
        <div className="h-full flex flex-col p-6 lg:p-8 gap-6 max-w-7xl mx-auto w-full">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
                        <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <span>{t('security.title', 'Security & Access Control')}</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                        Configure IP whitelist/blacklist, audit access logs, and rate limit rules.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    {activeTab !== 'config' && (
                        <button
                            onClick={handleRefresh}
                            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition shadow-sm"
                            title={t('security.refresh_data', 'Refresh')}
                        >
                            <RefreshCw size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-[#121214] rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-2 shadow-sm flex items-center gap-1.5 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap',
                                isActive
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
                            )}
                        >
                            <Icon size={15} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Main Content Card */}
            <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-[#121214] rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800">
                {renderContent()}
            </div>
        </div>
    );
};

export default Security;
