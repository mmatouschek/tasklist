import React, { useState } from 'react';
import { X, Shield, Lock, Mail, Check, BellRing } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNotifications: () => void;
  onOpenGitHubPages: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenNotifications,
  onOpenGitHubPages,
}) => {
  const {
    user,
    singleUserMode,
    setSingleUserMode,
    allowedOwnerEmail,
    setAllowedOwnerEmail,
  } = useAuth();

  const [inputEmail, setInputEmail] = useState(allowedOwnerEmail);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAllowedOwnerEmail(inputEmail);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/50">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">App & Security Settings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Owner protection for GitHub Pages</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Owner Lock Mode */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold">Single-User Owner Lock</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={singleUserMode}
                onChange={(e) => setSingleUserMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            When enabled, only your designated owner email can access and manage tasks when hosted publicly on GitHub Pages or custom domains. Any other visitor is locked out.
          </p>

          <form onSubmit={handleSave} className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Authorized Owner Email
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="marcomatouschek@gmail.com"
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
              >
                Save
              </button>
            </div>
            {savedSuccess && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Owner email updated!
              </p>
            )}
          </form>
        </div>

        {/* Quick Links */}
        <div className="space-y-2 text-xs">
          <button
            onClick={() => {
              onClose();
              onOpenNotifications();
            }}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between text-left transition"
          >
            <div className="flex items-center gap-2.5">
              <BellRing className="w-4 h-4 text-amber-500" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Push Notifications & Reminders</p>
                <p className="text-slate-400 text-[11px]">Manage browser push alerts and audio chimes</p>
              </div>
            </div>
            <span className="text-slate-400">&rarr;</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenGitHubPages();
            }}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between text-left transition"
          >
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">GitHub Pages Free Hosting Guide</p>
                <p className="text-slate-400 text-[11px]">How to deploy and configure Firebase domain</p>
              </div>
            </div>
            <span className="text-slate-400">&rarr;</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
