import { Mail, Diamond, Gem, Circle, Tag, Lock, Clock, ArrowRight, Sparkles, Bot, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Account } from '../../types/account';
import { formatTimeRemaining } from '../../utils/format';
import { findQuotaModel, getModelProtectionKey, getModelDisplayName, findImageQuotaModel } from '../../config/modelConfig';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface CurrentAccountProps {
    account: Account | null;
    onSwitch?: () => void;
}

export function CurrentAccount({ account, onSwitch }: CurrentAccountProps) {
    const { t } = useTranslation();

    if (!account) {
        return (
            <Card className="h-full flex flex-col justify-between">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
                        {t('dashboard.current_account', 'Current Account')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 mb-3">
                        <Mail className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                        {t('dashboard.no_active_account', 'No active account selected')}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        Select an account from the pool to route your API requests.
                    </p>
                    {onSwitch && (
                        <Button variant="primary" size="sm" onClick={onSwitch} className="mt-4">
                            Select Account
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    }

    const geminiProModel = findQuotaModel(account.quota?.models, 'gemini-pro');
    const geminiFlashModel = findQuotaModel(account.quota?.models, 'gemini-flash');
    const geminiImageModel = findImageQuotaModel(account.quota?.models);
    const claudeModel = findQuotaModel(account.quota?.models, 'claude');

    const nowSeconds = Math.floor(Date.now() / 1000);
    const imageProtectionKey = getModelProtectionKey(geminiImageModel?.name || '');
    const liveImageLimit = imageProtectionKey ? account.live_limited_models?.[imageProtectionKey] : undefined;
    const isImageLiveLimited = Boolean(liveImageLimit && liveImageLimit.until > nowSeconds);

    const isProProtected = account.protected_models?.includes('gemini-3-pro-high') || account.protected_models?.includes('gemini-3.1-pro-high');

    const renderTierBadge = () => {
        const tier = (account.quota?.subscription_tier || '').toLowerCase();
        if (tier.includes('ultra')) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold shadow-sm">
                    <Gem className="w-2.5 h-2.5" />
                    ULTRA
                </span>
            );
        } else if (tier.includes('pro')) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold shadow-sm">
                    <Diamond className="w-2.5 h-2.5" />
                    PRO
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] font-bold border border-slate-200 dark:border-zinc-800">
                <Circle className="w-2 h-2 fill-current text-slate-400" />
                FREE
            </span>
        );
    };

    return (
        <Card className="h-full flex flex-col justify-between">
            <div>
                {/* Header */}
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                        <CardTitle>{t('dashboard.current_account', 'Current Account')}</CardTitle>
                    </div>

                    <div className="flex items-center gap-2">
                        {renderTierBadge()}
                        {account.custom_label && (
                            <Badge variant="purple" size="sm">
                                <Tag className="w-2.5 h-2.5 mr-1" />
                                {account.custom_label}
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Account Info Pill */}
                    <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm shrink-0">
                                {(account.name || account.email).slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <span className="block text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                                    {account.name || account.email.split('@')[0]}
                                </span>
                                <span className="block text-xs text-slate-400 truncate">
                                    {account.email}
                                </span>
                            </div>
                        </div>

                        {onSwitch && (
                            <Button variant="ghost" size="xs" onClick={onSwitch} className="shrink-0 text-blue-600 dark:text-blue-400 font-semibold">
                                <span>Switch</span>
                                <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        )}
                    </div>

                    {/* Quota Progress Bars */}
                    <div className="space-y-3 pt-1">
                        {/* Gemini Pro */}
                        {geminiProModel && (
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-zinc-300">
                                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                                        <span>{getModelDisplayName(geminiProModel)}</span>
                                        {isProProtected && <Lock className="w-2.5 h-2.5 text-rose-500" />}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-blue-600 dark:text-blue-400">
                                            {geminiProModel.percentage}%
                                        </span>
                                        {geminiProModel.reset_time && (
                                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                                <Clock className="w-2.5 h-2.5" />
                                                {formatTimeRemaining(geminiProModel.reset_time)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(0, geminiProModel.percentage))}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Claude */}
                        {claudeModel && (
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-zinc-300">
                                        <Bot className="w-3.5 h-3.5 text-purple-500" />
                                        <span>{getModelDisplayName(claudeModel)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-purple-600 dark:text-purple-400">
                                            {claudeModel.percentage}%
                                        </span>
                                        {claudeModel.reset_time && (
                                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                                <Clock className="w-2.5 h-2.5" />
                                                {formatTimeRemaining(claudeModel.reset_time)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-600 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(0, claudeModel.percentage))}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Gemini Flash */}
                        {geminiFlashModel && (
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-zinc-300">
                                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>{getModelDisplayName(geminiFlashModel)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                            {geminiFlashModel.percentage}%
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(0, geminiFlashModel.percentage))}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Gemini Image */}
                        {geminiImageModel && (
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-zinc-300">
                                        <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Image Generation</span>
                                        {isImageLiveLimited && (
                                            <Badge variant="error" size="sm">Limited</Badge>
                                        )}
                                    </div>
                                    <span className="font-bold text-amber-600 dark:text-amber-400">
                                        {geminiImageModel.percentage}%
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(0, geminiImageModel.percentage))}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}

export default CurrentAccount;
