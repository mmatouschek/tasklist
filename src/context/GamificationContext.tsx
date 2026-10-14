import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Achievement,
  PREDEFINED_ACHIEVEMENTS,
  calculateLevel,
} from '../types/gamification';
import { Task } from '../types/task';
import {
  GamificationData,
  loadGamificationData,
  saveGamificationData,
  evaluateAchievements,
} from '../services/gamificationService';
import { usePalette } from './PaletteContext';

interface GamificationContextType {
  xp: number;
  levelInfo: ReturnType<typeof calculateLevel>;
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
  checkTasks: (tasks: Task[]) => void;
  recentUnlocked: Achievement | null;
  dismissUnlockToast: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { paletteSwitchesCount } = usePalette();
  const [data, setData] = useState<GamificationData>(() => loadGamificationData());
  const [recentUnlocked, setRecentUnlocked] = useState<Achievement | null>(null);

  const levelInfo = calculateLevel(data.xp);

  // Combine predefined achievements with unlock timestamps
  const achievements: Achievement[] = PREDEFINED_ACHIEVEMENTS.map((a) => {
    const unlockedAt = data.unlockedIds[a.id] || null;
    return {
      ...a,
      unlockedAt,
    };
  });

  const unlockedCount = Object.keys(data.unlockedIds).length;
  const totalCount = PREDEFINED_ACHIEVEMENTS.length;

  const checkTasks = (tasks: Task[]) => {
    const updated = evaluateAchievements(tasks, paletteSwitchesCount, data, (newlyUnlocked) => {
      setRecentUnlocked(newlyUnlocked);
    });
    if (updated !== data) {
      setData(updated);
    }
  };

  // Re-check when palette switches change
  useEffect(() => {
    const updated = evaluateAchievements([], paletteSwitchesCount, data, (newlyUnlocked) => {
      setRecentUnlocked(newlyUnlocked);
    });
    if (updated !== data) {
      setData(updated);
    }
  }, [paletteSwitchesCount]);

  const dismissUnlockToast = () => setRecentUnlocked(null);

  return (
    <GamificationContext.Provider
      value={{
        xp: data.xp,
        levelInfo,
        achievements,
        unlockedCount,
        totalCount,
        checkTasks,
        recentUnlocked,
        dismissUnlockToast,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const ctx = useContext(GamificationContext);
  if (!ctx) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return ctx;
};
