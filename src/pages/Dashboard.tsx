import { useEffect, useMemo, useRef, useState } from 'react';
import { save } from '@tauri-apps/plugin-dialog';
import {
    AlertTriangle,
    ArrowRight,
    Bot,
    Download,
    RefreshCw,
    Sparkles,
    Users,
    Clock,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AddAccountDialog from '../components/accounts/AddAccountDialog';
import { showToast } from '../components/common/ToastContainer';
import BestAccounts from '../components/dashboard/BestAccounts';
import CurrentAccount from '../components/dashboard/CurrentAccount';
import { findImageQuotaModel, findQuotaModel } from '../config/modelConfig';
import { exportAccounts } from '../services/accountService';
import { useAccountStore } from '../stores/useAccountStore';
import { Account } from '../types/account';
import { isTauri } from '../utils/env';
import { request as invoke } from '../utils/request';
import { MetricCard } from '../components/ui/MetricCard';
import { RadialGauge } from '../components/ui/RadialGauge';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

function Dashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        accounts,
        currentAccount,
        fetchAccounts,
        fetchCurrentAccount,
        switchAccount,
        addAccount,
        refreshQuota,
        loading
    } = useAccountStore();

    useEffect(() => {
        fetchAccounts();
        fetchCurrentAccount();
    }, [fetchAccounts, fetchCurrentAccount]);

    // Calculate aggregated statistics
    const stats = useMemo(() => {
        const getGeminiProQuota = (a: Account) =>
            findQuotaModel(a.quota?.models, 'gemini-pro')?.percentage || 0;

        const geminiQuotas = accounts
            .map(a => getGeminiProQuota(a))
            .filter(q => q > 0);

        const geminiImageQuotas = accounts
            .map(a => findImageQuotaModel(a.quota?.models)?.percentage || 0)
            .filter(q => q > 0);

        const claudeQuotas = accounts
            .map(a => findQuotaModel(a.quota?.models, 'claude')?.percentage || 0)
            .filter(q => q > 0);

        const lowQuotaCount = accounts.filter(a => {
            if (a.quota?.is_forbidden) return false;
            const gemini = getGeminiProQuota(a);
            const claude = findQuotaModel(a.quota?.models, 'claude')?.percentage || 0;
            return gemini < 20 || claude < 20;
        }).length;

        const avgGemini = geminiQuotas.length > 0
            ? Math.round(geminiQuotas.reduce((a, b) => a + b, 0) / geminiQuotas.length)
            : 0;

        const avgClaude = claudeQuotas.length > 0
            ? Math.round(claudeQuotas.reduce((a, b) => a + b, 0) / claudeQuotas.length)
            : 0;

        const poolHealthScore = accounts.length > 0
            ? Math.round((avgGemini * 0.6) + (avgClaude * 0.4))
            : 0;

        return {
            total: accounts.length,
            avgGemini,
            avgGeminiImage: geminiImageQuotas.length > 0
                ? Math.round(geminiImageQuotas.reduce((a, b) => a + b, 0) / geminiImageQuotas.length)
                : 0,
            avgClaude,
            lowQuota: lowQuotaCount,
            poolHealthScore,
        };
    }, [accounts]);

    const isSwitchingRef = useRef(false);

    const handleSwitch = async (accountId: string) => {
        if (loading || isSwitchingRef.current) return;
        isSwitchingRef.current = true;
        try {
            await switchAccount(accountId);
            showToast(t('dashboard.toast.switch_success', 'Account switched successfully'), 'success');
        } catch (error) {
            console.error('Failed to switch account:', error);
            showToast(`${t('dashboard.toast.switch_error', 'Failed to switch account')}: ${error}`, 'error');
        } finally {
            setTimeout(() => {
                isSwitchingRef.current = false;
            }, 1000);
        }
    };

    const handleAddAccount = async (email: string, refreshToken: string) => {
        await addAccount(email, refreshToken);
        await fetchAccounts();
    };

    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefreshCurrent = async () => {
        if (!currentAccount) return;
        setIsRefreshing(true);
        try {
            await refreshQuota(currentAccount.id);
            await fetchCurrentAccount();
            showToast(t('dashboard.toast.refresh_success', 'Quotas refreshed'), 'success');
        } catch (error) {
            console.error('[Dashboard] Refresh failed:', error);
            showToast(`${t('dashboard.toast.refresh_error', 'Refresh failed')}: ${error}`, 'error');
        } finally {
            setIsRefreshing(false);
        }
    };

    const exportAccountsToJson = async (accountsToExport: Account[]) => {
        try {
            if (accountsToExport.length === 0) {
                showToast(t('dashboard.toast.export_no_accounts', 'No accounts to export'), 'warning');
                return;
            }

            const accountIds = accountsToExport.map(acc => acc.id);
            const response = await exportAccounts(accountIds);

            if (!response.accounts || response.accounts.length === 0) {
                showToast(t('dashboard.toast.export_no_accounts', 'No accounts to export'), 'warning');
                return;
            }

            const content = JSON.stringify(response.accounts, null, 2);
            const fileName = `antigravity_accounts_${new Date().toISOString().split('T')[0]}.json`;

            if (isTauri()) {
                const path = await save({
                    filters: [{ name: 'JSON', extensions: ['json'] }],
                    defaultPath: fileName
                });
                if (!path) return;
                await invoke('save_text_file', { path, content });
                showToast(t('dashboard.toast.export_success', { path }), 'success');
            } else {
                const blob = new Blob([content], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast(t('dashboard.toast.export_success', { path: fileName }), 'success');
            }
        } catch (error: any) {
            console.error('Export failed:', error);
            showToast(`${t('dashboard.toast.export_error', 'Export error')}: ${error.toString()}`, 'error');
        }
    };

    return (
        <div className="h-full w-full overflow-y-auto p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {currentAccount
                            ? t('dashboard.hello', 'Welcome back, {{user}}').replace('{{user}}', currentAccount.name || currentAccount.email.split('@')[0])
                            : t('dashboard.hello', 'Welcome back')}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Real-time AI account health, quota distribution, and proxy routing telemetry.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="hidden sm:flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
                        <Clock className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        <span>5h Quota Cycle</span>
                    </div>

                    <AddAccountDialog onAdd={handleAddAccount} />

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRefreshCurrent}
                        disabled={isRefreshing || !currentAccount}
                        isLoading={isRefreshing}
                        icon={<RefreshCw className="w-3.5 h-3.5" />}
                        title={t('dashboard.refresh_quota', 'Refresh Quota')}
                    >
                        <span>{t('dashboard.refresh_quota', 'Refresh')}</span>
                    </Button>

                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => exportAccountsToJson(accounts)}
                        icon={<Download className="w-3.5 h-3.5" />}
                    >
                        <span>{t('dashboard.export_data', 'Export')}</span>
                    </Button>
                </div>
            </div>

            {/* 4 Top Metric Cards (Shopeers Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title={t('dashboard.total_accounts', 'Connected Accounts')}
                    value={stats.total}
                    subtitle="All accounts configured in pool"
                    icon={<Users className="w-4 h-4" />}
                    iconBgColor="blue"
                    delta={{ value: 'Active', isPositive: true }}
                    onClick={() => navigate('/accounts')}
                />

                <MetricCard
                    title={t('dashboard.avg_gemini', 'Avg Gemini Quota')}
                    value={`${stats.avgGemini}%`}
                    subtitle={stats.avgGemini >= 50 ? t('dashboard.quota_sufficient', 'Healthy availability') : t('dashboard.quota_low', 'Low quota')}
                    icon={<Sparkles className="w-4 h-4" />}
                    iconBgColor="emerald"
                    delta={{
                        value: stats.avgGemini >= 50 ? 'Sufficient' : 'Low',
                        isPositive: stats.avgGemini >= 50,
                    }}
                />

                <MetricCard
                    title={t('dashboard.avg_claude', 'Avg Claude Quota')}
                    value={`${stats.avgClaude}%`}
                    subtitle="Ready for intelligent fallback"
                    icon={<Bot className="w-4 h-4" />}
                    iconBgColor="purple"
                    delta={{
                        value: stats.avgClaude >= 50 ? 'Optimal' : 'Attention',
                        isPositive: stats.avgClaude >= 50,
                    }}
                />

                <MetricCard
                    title={t('dashboard.low_quota_accounts', 'Quota Alerts')}
                    value={stats.lowQuota}
                    subtitle={stats.lowQuota === 0 ? 'All accounts above 20%' : `${stats.lowQuota} accounts under 20%`}
                    icon={<AlertTriangle className="w-4 h-4" />}
                    iconBgColor={stats.lowQuota > 0 ? 'amber' : 'cyan'}
                    delta={{
                        value: stats.lowQuota === 0 ? 'Protected' : 'Warning',
                        isPositive: stats.lowQuota === 0,
                    }}
                />
            </div>

            {/* Middle Section: Capacity Area Chart & Quota Health Gauge (2/3 + 1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2/3 Quota Capacity Overview Card */}
                <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Capacity Telemetry
                                </span>
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                                    AI Model Pool Availability
                                </h3>
                            </div>
                            <Button
                                variant="outline"
                                size="xs"
                                onClick={() => navigate('/token-stats')}
                                className="text-blue-600 dark:text-blue-400 font-semibold"
                            >
                                <span>Token Analytics</span>
                                <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </div>

                        {/* Smooth SVG Capacity Visualizer */}
                        <div className="h-48 w-full relative mt-2">
                            <svg viewBox="0 0 600 160" className="w-full h-full overflow-visible">
                                <defs>
                                    <linearGradient id="geminiGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                                    </linearGradient>
                                    <linearGradient id="claudeGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#A855F7" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>

                                {/* Guide Lines */}
                                <line x1="0" y1="30" x2="600" y2="30" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3" />
                                <line x1="0" y1="75" x2="600" y2="75" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3" />
                                <line x1="0" y1="120" x2="600" y2="120" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3" />

                                {/* Claude Area */}
                                <path
                                    d="M 0 110 Q 150 70 300 95 T 600 65 L 600 160 L 0 160 Z"
                                    fill="url(#claudeGradient)"
                                />
                                <path
                                    d="M 0 110 Q 150 70 300 95 T 600 65"
                                    fill="none"
                                    stroke="#9333EA"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />

                                {/* Gemini Area */}
                                <path
                                    d="M 0 90 Q 120 40 260 60 T 600 30 L 600 160 L 0 160 Z"
                                    fill="url(#geminiGradient)"
                                />
                                <path
                                    d="M 0 90 Q 120 40 260 60 T 600 30"
                                    fill="none"
                                    stroke="#2563EB"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />

                                {/* Highlight Node */}
                                <circle cx="260" cy="60" r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
                            </svg>
                        </div>
                    </div>

                    {/* Model breakdown chips */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                        <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[11px] text-slate-400 truncate">Gemini Pro</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                    {stats.avgGemini}%
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[11px] text-slate-400 truncate">Claude 3.7</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                    {stats.avgClaude}%
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[11px] text-slate-400 truncate">Gemini Image</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                    {stats.avgGeminiImage}%
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 1/3 Quota Health Index Gauge (Inspired by Shopeers Repeat Customer Rate) */}
                <Card className="p-6 flex flex-col justify-between">
                    <div>
                        <CardHeader className="p-0 pb-2">
                            <div>
                                <CardTitle className="text-base">Quota Health Score</CardTitle>
                                <CardDescription>Aggregate router pool capacity</CardDescription>
                            </div>
                        </CardHeader>

                        <div className="py-4">
                            <RadialGauge
                                percentage={stats.poolHealthScore}
                                label="Pool Capacity"
                                targetText="Composite score of all monitored accounts. Automatic failover occurs if an account drops below 10%."
                                color="#2563EB"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => navigate('/accounts')}
                        >
                            <Users className="w-3.5 h-3.5 mr-1" />
                            <span>{t('dashboard.view_all_accounts', 'View All Accounts')}</span>
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Bottom Section: Current Account & Best Accounts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CurrentAccount
                    account={currentAccount}
                    onSwitch={() => navigate('/accounts')}
                />
                <BestAccounts
                    accounts={accounts}
                    currentAccountId={currentAccount?.id}
                    onSwitch={handleSwitch}
                />
            </div>
        </div>
    );
}

export default Dashboard;
