import React from 'react';
import { useTranslation } from 'react-i18next';
import { Activity } from 'lucide-react';
import { ProxyMonitor } from '../components/proxy/ProxyMonitor';

const Monitor: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="h-full flex flex-col p-6 lg:p-8 gap-5 max-w-7xl mx-auto w-full">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                        <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <span>{t('nav.call_records', 'Live Monitor & Logs')}</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Real-time streaming proxy requests, status codes, latency, and payload inspection.
                    </p>
                </div>
            </div>

            <ProxyMonitor className="flex-1" />
        </div>
    );
};

export default Monitor;