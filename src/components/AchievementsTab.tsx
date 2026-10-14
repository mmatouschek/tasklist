import React, { useState } from 'react';
import { Trophy, Award, Lock, Sparkles, CheckCircle2, Star, Flame, Eye, EyeOff } from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { Achievement, TrophyTier } from '../types/gamification';

export const AchievementsTab: React.FC = () => {
  const { xp, levelInfo, achievements, unlockedCount, totalCount } = useGamification();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredAchievements = achievements.filter((ach) => {
    if (filter === 'unlocked') return !!ach.unlockedAt;
    if (filter === 'locked') return !ach.unlockedAt;
    return true;
  });

  const getTierDetails = (tier: TrophyTier) => {
    switch (tier) {
      case 'platinum':
        return {
          bg: 'bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border-cyan-400/50',
          text: 'text-cyan-400',
          badge: 'bg-cyan-500 text-slate-950 font-black',
          label: 'Platinum',
        };
      case 'gold':
        return {
          bg: 'bg-amber-500/10 border-amber-500/40',
          text: 'text-amber-400',
          badge: 'bg-amber-500 text-slate-950 font-bold',
          label: 'Gold',
        };
      case 'silver':
        return {
          bg: 'bg-slate-300/10 border-slate-300/40',
          text: 'text-slate-300',
          badge: 'bg-slate-300 text-slate-900 font-bold',
          label: 'Silver',
        };
      case 'bronze':
      default:
        return {
          bg: 'bg-orange-700/10 border-orange-600/30',
          text: 'text-orange-400',
          badge: 'bg-orange-600 text-white font-bold',
          label: 'Bronze',
        };
    }
  };

  const bronzeCount = achievements.filter((a) => a.tier === 'bronze' && a.unlockedAt).length;
  const silverCount = achievements.filter((a) => a.tier === 'silver' && a.unlockedAt).length;
  const goldCount = achievements.filter((a) => a.tier === 'gold' && a.unlockedAt).length;
  const platinumCount = achievements.filter((a) => a.tier === 'platinum' && a.unlockedAt).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Player Level & XP Hero Banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 border shadow-lg transition-all"
        style={{
          backgroundColor: 'var(--app-bg-surface)',
          borderColor: 'var(--app-border-strong)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: 'var(--app-accent-soft)',
                color: 'var(--app-accent)',
              }}
            >
              <Trophy className="w-3.5 h-3.5" />
              Trophy Room & Gamification
            </div>
            
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner border"
                style={{
                  backgroundColor: 'var(--app-bg-elevated)',
                  borderColor: 'var(--app-accent)',
                  color: 'var(--app-accent)',
                }}
              >
                {levelInfo.level}
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
                  <span>{levelInfo.title}</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h2>
                <p className="text-xs text-slate-400">
                  Total Experience: <strong className="text-slate-200">{xp} XP</strong> • {unlockedCount}/{totalCount} Trophies Earned
                </p>
              </div>
            </div>
          </div>

          {/* Trophy Cabinet Summary Counters */}
          <div className="grid grid-cols-4 gap-2 md:gap-3 shrink-0">
            <div className="p-2.5 rounded-xl text-center border" style={{ backgroundColor: 'var(--app-bg-elevated)', borderColor: 'var(--app-border-subtle)' }}>
              <span className="text-base font-black text-cyan-400">{platinumCount}</span>
              <p className="text-[10px] font-semibold text-slate-400">Plat</p>
            </div>
            <div className="p-2.5 rounded-xl text-center border" style={{ backgroundColor: 'var(--app-bg-elevated)', borderColor: 'var(--app-border-subtle)' }}>
              <span className="text-base font-black text-amber-400">{goldCount}</span>
              <p className="text-[10px] font-semibold text-slate-400">Gold</p>
            </div>
            <div className="p-2.5 rounded-xl text-center border" style={{ backgroundColor: 'var(--app-bg-elevated)', borderColor: 'var(--app-border-subtle)' }}>
              <span className="text-base font-black text-slate-300">{silverCount}</span>
              <p className="text-[10px] font-semibold text-slate-400">Silver</p>
            </div>
            <div className="p-2.5 rounded-xl text-center border" style={{ backgroundColor: 'var(--app-bg-elevated)', borderColor: 'var(--app-border-subtle)' }}>
              <span className="text-base font-black text-orange-400">{bronzeCount}</span>
              <p className="text-[10px] font-semibold text-slate-400">Bronze</p>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-6 space-y-1.5 relative z-10">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Level {levelInfo.level} Progress</span>
            <span className="font-semibold text-slate-300">
              {levelInfo.progressPercent}% ({levelInfo.currentTierXp} / {levelInfo.nextTierXp} XP to Level {levelInfo.level + 1})
            </span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden p-0.5" style={{ backgroundColor: 'var(--app-bg-elevated)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${levelInfo.progressPercent}%`,
                backgroundColor: 'var(--app-accent)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-xl p-1 border text-xs font-semibold"
          style={{
            backgroundColor: 'var(--app-bg-surface)',
            borderColor: 'var(--app-border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Trophies ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'unlocked'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('locked')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'locked'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Locked ({totalCount - unlockedCount})
          </button>
        </div>
        <div className="text-xs text-slate-400 hidden sm:block">
          Complete quests & tasks to unlock achievements
        </div>
      </div>

      {/* Achievements Trophy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredAchievements.map((ach) => {
          const isUnlocked = !!ach.unlockedAt;
          const tier = getTierDetails(ach.tier);
          const isSecretMasked = ach.isHidden && !isUnlocked;

          return (
            <div
              key={ach.id}
              className={`relative rounded-2xl p-4 border transition-all duration-200 ${
                isUnlocked
                  ? 'shadow-sm'
                  : 'opacity-70 hover:opacity-90'
              }`}
              style={{
                backgroundColor: isUnlocked ? 'var(--app-bg-surface)' : 'var(--app-bg-base)',
                borderColor: isUnlocked ? 'var(--app-border-strong)' : 'var(--app-border-subtle)',
              }}
            >
              <div className="flex items-start gap-3.5">
                {/* Icon box */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border ${
                    isUnlocked
                      ? tier.bg
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-500'
                  }`}
                >
                  {isUnlocked ? (
                    ach.icon
                  ) : isSecretMasked ? (
                    <Lock className="w-5 h-5 text-slate-500" />
                  ) : (
                    <span className="grayscale opacity-50">{ach.icon}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{ach.title}</span>
                        {ach.isHidden && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950/70 text-purple-300 border border-purple-800/50 font-mono">
                            Secret
                          </span>
                        )}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${tier.badge}`}>
                        {tier.label}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                        +{ach.xp} XP
                      </span>
                    </div>
                  </div>

                  {/* Description or Secret Hint */}
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isSecretMasked ? (
                      <span className="italic text-slate-500">
                        {ach.secretHint || 'Hidden achievement. Continue completing tasks to unveil!'}
                      </span>
                    ) : (
                      ach.description
                    )}
                  </p>

                  {/* Status / Timestamp */}
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    {isUnlocked ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Unlocked{' '}
                        {new Date(ach.unlockedAt!).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
