import confetti from 'canvas-confetti';
import { Task } from '../types/task';
import { Achievement, PREDEFINED_ACHIEVEMENTS, calculateLevel } from '../types/gamification';
import { playNotificationChime } from './notificationService';

const UNLOCKED_KEY = 'taskpulse_unlocked_achievements';
const XP_KEY = 'taskpulse_user_xp';

export interface GamificationData {
  xp: number;
  unlockedIds: Record<string, string>; // id -> ISO timestamp
}

export function loadGamificationData(): GamificationData {
  try {
    const rawUnlocked = localStorage.getItem(UNLOCKED_KEY);
    const rawXp = localStorage.getItem(XP_KEY);
    return {
      xp: rawXp ? Number(rawXp) : 0,
      unlockedIds: rawUnlocked ? JSON.parse(rawUnlocked) : {},
    };
  } catch {
    return { xp: 0, unlockedIds: {} };
  }
}

export function saveGamificationData(data: GamificationData) {
  try {
    localStorage.setItem(UNLOCKED_KEY, JSON.stringify(data.unlockedIds));
    localStorage.setItem(XP_KEY, String(data.xp));
  } catch {
    // ignore
  }
}

export function evaluateAchievements(
  tasks: Task[],
  paletteSwitches: number,
  currentData: GamificationData,
  onUnlockNew?: (achievement: Achievement) => void
): GamificationData {
  let updatedXp = currentData.xp;
  const updatedUnlocked = { ...currentData.unlockedIds };
  const newlyUnlockedList: Achievement[] = [];

  const completedTasks = tasks.filter((t) => t.completed);
  const now = new Date();
  const currentHour = now.getHours();

  // Helper to test and unlock
  const tryUnlock = (achId: string, condition: boolean) => {
    if (condition && !updatedUnlocked[achId]) {
      const ach = PREDEFINED_ACHIEVEMENTS.find((a) => a.id === achId);
      if (ach) {
        updatedUnlocked[achId] = new Date().toISOString();
        updatedXp += ach.xp;
        newlyUnlockedList.push(ach);
      }
    }
  };

  // 1. first_quest: Complete your first task
  tryUnlock('first_quest', completedTasks.length >= 1);

  // 2. trio_strike: Complete 3 tasks
  tryUnlock('trio_strike', completedTasks.length >= 3);

  // 3. urgent_conqueror: Complete an urgent task
  tryUnlock(
    'urgent_conqueror',
    completedTasks.some((t) => t.priority === 'urgent')
  );

  // 4. multitasker: At least 3 categories created
  const uniqueCats = new Set(tasks.map((t) => t.category.toLowerCase().trim()).filter(Boolean));
  tryUnlock('multitasker', uniqueCats.size >= 3);

  // 5. century_club: 10 total tasks created
  tryUnlock('century_club', tasks.length >= 10);

  // 6. punctual_prodigy: Completed task with due date before deadline
  tryUnlock(
    'punctual_prodigy',
    completedTasks.some((t) => {
      if (!t.dueDate || !t.completedAt) return false;
      return new Date(t.completedAt).getTime() <= new Date(t.dueDate).getTime();
    })
  );

  // 7. tag_virtuoso: Task with 3+ tags
  tryUnlock('tag_virtuoso', tasks.some((t) => t.tags && t.tags.length >= 3));

  // 8. clean_slate: All tasks in a category completed (with at least 1 task in that category)
  if (tasks.length > 0) {
    const catMap: Record<string, { total: number; completed: number }> = {};
    tasks.forEach((t) => {
      const cat = t.category.trim() || 'General';
      if (!catMap[cat]) catMap[cat] = { total: 0, completed: 0 };
      catMap[cat].total += 1;
      if (t.completed) catMap[cat].completed += 1;
    });

    const hasCleanCategory = Object.values(catMap).some(
      (entry) => entry.total >= 1 && entry.completed === entry.total
    );
    tryUnlock('clean_slate', hasCleanCategory);
  }

  // 9. speed_demon: (Secret) Completed within 3 minutes of creation
  tryUnlock(
    'speed_demon',
    completedTasks.some((t) => {
      if (!t.completedAt || !t.createdAt) return false;
      const diffMs = new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime();
      return diffMs >= 0 && diffMs <= 3 * 60 * 1000;
    })
  );

  // 10. night_owl: (Secret) Active between 10 PM and 4 AM
  tryUnlock('night_owl', currentHour >= 22 || currentHour < 4);

  // 11. early_bird: (Secret) Active between 5 AM and 8 AM
  tryUnlock('early_bird', currentHour >= 5 && currentHour < 8);

  // 12. palette_stylist: (Secret) 3 palette switches
  tryUnlock('palette_stylist', paletteSwitches >= 3);

  // 13. grand_champion: (Secret) 8+ achievements and level 3+
  const totalUnlockedCount = Object.keys(updatedUnlocked).length;
  const currentLvl = calculateLevel(updatedXp).level;
  tryUnlock('grand_champion', totalUnlockedCount >= 8 && currentLvl >= 3);

  // If new achievements were unlocked
  if (newlyUnlockedList.length > 0) {
    const nextData: GamificationData = {
      xp: updatedXp,
      unlockedIds: updatedUnlocked,
    };
    saveGamificationData(nextData);

    // Play chime and trigger confetti
    playNotificationChime();
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#3b82f6', '#ec4899', '#10b981'],
    });

    newlyUnlockedList.forEach((ach) => {
      if (onUnlockNew) onUnlockNew(ach);
    });

    return nextData;
  }

  return currentData;
}
