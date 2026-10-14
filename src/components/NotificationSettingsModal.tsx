import React, { useState, useEffect } from 'react';
import { X, Bell, BellRing, Volume2, Shield, Check, AlertTriangle } from 'lucide-react';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  sendLocalNotification,
  playNotificationChime,
  NotificationPermissionStatus,
} from '../services/notificationService';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [status, setStatus] = useState<NotificationPermissionStatus>('default');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('taskpulse_sound') !== 'false';
  });
  const [testSuccess, setTestSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStatus(getNotificationPermissionStatus());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setStatus(res);
  };

  const handleTestNotification = () => {
    if (soundEnabled) {
      playNotificationChime();
    }

    const success = sendLocalNotification('🎉 Test Alert: TaskPulse Notifications Working!', {
      body: 'You will receive reminders before task deadlines automatically.',
    });

    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 3000);
  };

  const toggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('taskpulse_sound', String(enabled));
    if (enabled) {
      playNotificationChime();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/50">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Deadline Reminders</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Push notifications and audio alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Status Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Browser Permission
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                status === 'granted'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                  : status === 'denied'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
              }`}
            >
              {status === 'granted' ? 'Allowed' : status === 'denied' ? 'Blocked' : 'Not Requested'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            {status === 'granted'
              ? 'TaskPulse is permitted to send browser push notifications when task deadlines approach.'
              : status === 'denied'
              ? 'Notifications are blocked in your browser site settings. Click the lock icon in your address bar to enable.'
              : 'Allow notifications so TaskPulse can alert you before tasks reach their deadlines.'}
          </p>

          {status !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition"
            >
              <Bell className="w-4 h-4" />
              Enable Push Notifications
            </button>
          )}
        </div>

        {/* Chime Sound Option */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Audio Chime</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Play a subtle sound when a deadline fires</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => toggleSound(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Test Notification Trigger */}
        <div className="space-y-2">
          <button
            onClick={handleTestNotification}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs flex items-center justify-center gap-2 transition text-slate-700 dark:text-slate-200"
          >
            <BellRing className="w-4 h-4 text-amber-500" />
            Send Test Notification & Play Chime
          </button>
          {testSuccess && (
            <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5" /> Notification trigger sent!
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
