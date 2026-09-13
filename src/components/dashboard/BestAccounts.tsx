import { TrendingUp, Sparkles, Bot, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Account, QuotaGroup } from '../../types/account';
import { findQuotaModel } from '../../config/modelConfig';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface BestAccountsProps {
    accounts: Account[];
    currentAccountId?: string;
    onSwitch?: (accountId: string) => void;
}

/** 从 quota_groups 中提取 5h 或 Weekly 桶百分比 (0-100) */
function getBucketPercentage(
    quotaGroups: QuotaGroup[] | undefined,
    category: 'gemini' | 'claude',
    targetWindow: '5h' | 'weekly'
): number | null {
    if (!quotaGroups || quotaGroups.length === 0) return null;

    for (const group of quotaGroups) {
        const name = (group.display_name || '').toLowerCase();
        const isTarget = category === 'claude'
            ? (name.includes('claude') || name.includes('gpt'))
            : (name.includes('gemini') || !name.includes('claude'));

        if (isTarget) {
            const bucket = group.buckets?.find(b => {
                const win = (b.window || '').toLowerCase();
                const id = (b.bucket_id || '').toLowerCase();
                if (targetWindow === 'weekly') {
                    return win.includes('week') || id.includes('week');
                } else {
                    return win.includes('5h') || id.includes('5h') || win.includes('hour') || id.includes('hour');
                }
            });

            if (bucket && typeof bucket.remaining_fraction === 'number') {
                return Math.round(bucket.remaining_fraction * 100);
            }
        }
    }
    return null;
}

function calculateEffectiveQuota(
    fiveHourFromModel: number | null,
    weeklyFromGroup: number | null,
    fiveHourFromGroup: number | null
): number {
    const fiveHour = fiveHourFromGroup !== null ? fiveHourFromGroup : fiveHourFromModel;
    const weekly = weeklyFromGroup;

    if (fiveHour !== null && weekly !== null) {
        return Math.min(fiveHour, weekly);
    }
    if (weekly !== null) {
        return weekly;
    }
    if (fiveHour !== null) {
        return fiveHour;
    }
    return 0;
}

export function BestAccounts({ accounts, currentAccountId, onSwitch }: BestAccountsProps) {
    const { t } = useTranslation();

    const geminiSorted = accounts
        .filter(a => a.id !== currentAccountId && !a.disabled && !a.proxy_disabled)
        .map(a => {
            const pro5hModel = findQuotaModel(a.quota?.models, 'gemini-pro')?.percentage ?? null;
            const flash5hModel = findQuotaModel(a.quota?.models, 'gemini-flash')?.percentage ?? null;
            const weeklyGroup = getBucketPercentage(a.quota?.quota_groups, 'gemini', 'weekly');
            const fiveHourGroup = getBucketPercentage(a.quota?.quota_groups, 'gemini', '5h');

            const effectivePro = calculateEffectiveQuota(pro5hModel, weeklyGroup, fiveHourGroup);
            const effectiveFlash = calculateEffectiveQuota(flash5hModel, weeklyGroup, fiveHourGroup);

            let score = Math.round(effectivePro * 0.7 + effectiveFlash * 0.3);
            if (weeklyGroup !== null && weeklyGroup <= 5) score = 0;

            return { ...a, quotaVal: score };
        })
        .filter(a => a.quotaVal > 0)
        .sort((a, b) => b.quotaVal - a.quotaVal);

    const claudeSorted = accounts
        .filter(a => a.id !== currentAccountId && !a.disabled && !a.proxy_disabled)
        .map(a => {
            const claude5hModel = findQuotaModel(a.quota?.models, 'claude')?.percentage ?? null;
            const weeklyGroup = getBucketPercentage(a.quota?.quota_groups, 'claude', 'weekly');
            const fiveHourGroup = getBucketPercentage(a.quota?.quota_groups, 'claude', '5h');

            let score = calculateEffectiveQuota(claude5hModel, weeklyGroup, fiveHourGroup);
            if (weeklyGroup !== null && weeklyGroup <= 5) score = 0;

            return { ...a, quotaVal: score };
        })
        .filter(a => a.quotaVal > 0)
        .sort((a, b) => b.quotaVal - a.quotaVal);

    let bestGemini = geminiSorted[0];
    let bestClaude = claudeSorted[0];

    if (bestGemini && bestClaude && bestGemini.id === bestClaude.id) {
        const nextGemini = geminiSorted[1];
        const nextClaude = claudeSorted[1];

        const scoreA = bestGemini.quotaVal + (nextClaude?.quotaVal || 0);
        const scoreB = (nextGemini?.quotaVal || 0) + bestClaude.quotaVal;

        if (nextClaude && (!nextGemini || scoreA >= scoreB)) {
            bestClaude = nextClaude;
        } else if (nextGemini) {
            bestGemini = nextGemini;
        }
    }

    const bestGeminiRender = bestGemini ? { ...bestGemini, geminiQuota: bestGemini.quotaVal } : undefined;
    const bestClaudeRender = bestClaude ? { ...bestClaude, claudeQuota: bestClaude.quotaVal } : undefined;

    return (
        <Card className="h-full flex flex-col justify-between">
            <div>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <CardTitle>{t('dashboard.best_accounts', 'Best Standby Accounts')}</CardTitle>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                        Ranked by capacity
                    </span>
                </CardHeader>

                <CardContent className="space-y-3">
                    {/* Gemini Best */}
                    {bestGeminiRender && (
                        <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                                        {t('dashboard.for_gemini', 'Optimal for Gemini')}
                                    </span>
                                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate block">
                                        {bestGeminiRender.name || bestGeminiRender.email.split('@')[0]}
                                    </span>
                                    <span className="text-[11px] text-slate-400 truncate block">
                                        {bestGeminiRender.email}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="px-2.5 py-1 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-sm shadow-emerald-600/20">
                                    {bestGeminiRender.geminiQuota}%
                                </span>
                                {onSwitch && (
                                    <button
                                        onClick={() => onSwitch(bestGeminiRender.id)}
                                        className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 shadow-sm transition"
                                        title="Switch to this account"
                                    >
                                        <Zap className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Claude Best */}
                    {bestClaudeRender && (
                        <div className="p-3.5 bg-cyan-50/60 dark:bg-cyan-950/30 rounded-xl border border-cyan-200/50 dark:border-cyan-800/40 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">
                                        {t('dashboard.for_claude', 'Optimal for Claude')}
                                    </span>
                                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate block">
                                        {bestClaudeRender.name || bestClaudeRender.email.split('@')[0]}
                                    </span>
                                    <span className="text-[11px] text-slate-400 truncate block">
                                        {bestClaudeRender.email}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="px-2.5 py-1 text-xs font-bold bg-cyan-600 text-white rounded-xl shadow-sm shadow-cyan-600/20">
                                    {bestClaudeRender.claudeQuota}%
                                </span>
                                {onSwitch && (
                                    <button
                                        onClick={() => onSwitch(bestClaudeRender.id)}
                                        className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 shadow-sm transition"
                                        title="Switch to this account"
                                    >
                                        <Zap className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {!bestGeminiRender && !bestClaudeRender && (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            {t('accounts.no_data', 'No standby accounts available')}
                        </div>
                    )}
                </CardContent>
            </div>

            {(bestGeminiRender || bestClaudeRender) && onSwitch && (
                <div className="p-5 pt-0">
                    <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                            let targetId = bestGeminiRender?.id;
                            if (bestClaudeRender && (!bestGeminiRender || bestClaudeRender.claudeQuota > bestGeminiRender.geminiQuota)) {
                                targetId = bestClaudeRender.id;
                            }
                            if (targetId) onSwitch(targetId);
                        }}
                    >
                        <Zap className="w-3.5 h-3.5 mr-1" />
                        <span>{t('dashboard.switch_best', 'Switch to Highest Quota Account')}</span>
                    </Button>
                </div>
            )}
        </Card>
    );
}

export default BestAccounts;
