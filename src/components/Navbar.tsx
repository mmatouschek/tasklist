import React from 'react';
import {
  CheckCircle2,
  Bell,
  Globe,
  Settings,
  LogOut,
  LogIn,
  Trophy,
  ListTodo,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { PalettePicker } from './PalettePicker';
import { getNotificationPermissionStatus } from '../services/notificationService';

interface NavbarProps {
  activeTab: 'tasks' | 'achievements';
  setActiveTab: (tab: 'tasks' | 'achievements') => void;
  onOpenNotifications: () => void;
  onOpenGitHubPages: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNotifications,
  onOpenGitHubPages,
  onOpenSettings,
}) => {
  const { user, signInWithGoogle, signOutUser } = useAuth();
  const { levelInfo, xp, unlockedCount, totalCount } = useGamification();

  const notifStatus = getNotificationPermissionStatus();

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-md border-b transition-colors"
      style={{
        backgroundColor: 'rgba(20, 21, 27, 0.85)',
        borderColor: 'var(--app-border-strong)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        
        {/* Brand & Tab Navigation */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black shadow-md"
              style={{
                backgroundColor: 'var(--app-accent)',
                color: 'var(--app-accent-contrast)',
              }}
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-100">
                  TaskPulse
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded-full border border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs: Quests (Tasks) vs Achievements */}
          <nav className="flex items-center gap-1 p-1 rounded-xl border"
            style={{
              backgroundColor: 'var(--app-bg-surface)',
              borderColor: 'var(--app-border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition`}
              style={{
                backgroundColor: activeTab === 'tasks' ? 'var(--app-accent)' : 'transparent',
                color: activeTab === 'tasks' ? 'var(--app-accent-contrast)' : 'var(--app-text-secondary)',
              }}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Quests</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('achievements')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition relative`}
              style={{
                backgroundColor: activeTab === 'achievements' ? 'var(--app-accent)' : 'transparent',
                color: activeTab === 'achievements' ? 'var(--app-accent-contrast)' : 'var(--app-text-secondary)',
              }}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Trophies</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-900/60 text-amber-300">
                {unlockedCount}/{totalCount}
              </span>
            </button>
          </nav>
        </div>

        {/* Right Section: Level Badge + Palette Picker + Notifications + Settings + Profile */}
        <div className="flex items-center gap-2">
          
          {/* Level & XP Chip (Gamification indicator) */}
          <div
            onClick={() => setActiveTab('achievements')}
            className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-xl border cursor-pointer hover:opacity-90 transition text-xs"
            style={{
              backgroundColor: 'var(--app-bg-surface)',
              borderColor: 'var(--app-border-subtle)',
            }}
            title="View Level & Achievements"
          >
            <span
              className="w-5 h-5 rounded-md flex items-center justify-center font-black text-[11px]"
              style={{
                backgroundColor: 'var(--app-accent)',
                color: 'var(--app-accent-contrast)',
              }}
            >
              {levelInfo.level}
            </span>
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-slate-200">Lvl {levelInfo.level}</span>
              <span className="text-slate-400 ml-1.5 font-mono text-[10px]">{xp} XP</span>
            </div>
          </div>

          {/* Color Palette Dropdown Picker (Replaced dark mode) */}
          <PalettePicker />

          {/* Notifications Button */}
          <button
            type="button"
            onClick={onOpenNotifications}
            title="Notification alerts"
            className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <Bell className="w-4 h-4" />
            {notifStatus === 'granted' && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--app-accent)' }}
              />
            )}
          </button>

          {/* GitHub Pages Modal Button */}
          <button
            type="button"
            onClick={onOpenGitHubPages}
            title="Host freely on GitHub Pages"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-800 border transition"
            style={{
              borderColor: 'var(--app-border-subtle)',
              color: 'var(--app-text-secondary)',
            }}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>GitHub Pages</span>
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Settings & Security"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Auth State */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
              <div
                title={user.email || 'User'}
                className="w-8 h-8 rounded-full overflow-hidden bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400 border border-amber-500/30"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span>{(user.displayName || user.email || 'U')[0].toUpperCase()}</span>
                )}
              </div>
              <button
                type="button"
                onClick={signOutUser}
                title="Sign out"
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-sm ml-1"
              style={{
                backgroundColor: 'var(--app-accent)',
                color: 'var(--app-accent-contrast)',
              }}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
