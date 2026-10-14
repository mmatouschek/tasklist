import React from 'react';
import { ShieldAlert, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const OwnerLockScreen: React.FC = () => {
  const { user, allowedOwnerEmail, signOutUser } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center border border-rose-200 dark:border-rose-800">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Private Personal Workspace</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This to-do application is locked to its authorized owner only.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Signed in as:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.email || 'Unknown User'}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Authorized Owner:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{allowedOwnerEmail}</span>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          If you are the owner, please sign out and sign in using your designated account ({allowedOwnerEmail}).
        </p>

        <button
          onClick={signOutUser}
          className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out of This Account
        </button>
      </div>
    </div>
  );
};
