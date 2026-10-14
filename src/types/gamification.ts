export type TrophyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  secretHint?: string;
  tier: TrophyTier;
  xp: number;
  icon: string;
  isHidden: boolean; // if true, description is masked until unlocked
  unlockedAt?: string | null;
}

export interface GamificationState {
  xp: number;
  level: number;
  unlockedIds: string[];
  paletteSwitches: number;
}

export const PREDEFINED_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_quest',
    title: 'First Step',
    description: 'Complete your first task in TaskPulse.',
    tier: 'bronze',
    xp: 50,
    icon: '🎯',
    isHidden: false,
  },
  {
    id: 'trio_strike',
    title: 'Hat Trick',
    description: 'Complete 3 tasks in total.',
    tier: 'bronze',
    xp: 100,
    icon: '⚡',
    isHidden: false,
  },
  {
    id: 'urgent_conqueror',
    title: 'Crisis Averted',
    description: 'Complete any task marked with Urgent priority.',
    tier: 'silver',
    xp: 150,
    icon: '🔥',
    isHidden: false,
  },
  {
    id: 'multitasker',
    title: 'Category Pioneer',
    description: 'Create tasks across at least 3 distinct categories.',
    tier: 'bronze',
    xp: 100,
    icon: '📂',
    isHidden: false,
  },
  {
    id: 'century_club',
    title: 'Quest Master',
    description: 'Accumulate 10 or more total tasks in your workspace.',
    tier: 'silver',
    xp: 200,
    icon: '📜',
    isHidden: false,
  },
  {
    id: 'punctual_prodigy',
    title: 'Punctual Prodigy',
    description: 'Complete a task with an upcoming due date before it expires.',
    tier: 'silver',
    xp: 150,
    icon: '⏱️',
    isHidden: false,
  },
  {
    id: 'tag_virtuoso',
    title: 'Tag Virtuoso',
    description: 'Create a task tagged with 3 or more tags.',
    tier: 'bronze',
    xp: 100,
    icon: '🏷️',
    isHidden: false,
  },
  {
    id: 'clean_slate',
    title: 'Zero Pending',
    description: 'Complete every task in a category so that zero active items remain.',
    tier: 'gold',
    xp: 250,
    icon: '✨',
    isHidden: false,
  },

  // Hidden / Secret Achievements (Title visible, condition hidden)
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Completed a task within 3 minutes of creating it.',
    secretHint: 'Complete a newly forged quest in record time.',
    tier: 'silver',
    xp: 200,
    icon: '🏎️',
    isHidden: true,
  },
  {
    id: 'night_owl',
    title: 'Midnight Crafter',
    description: 'Completed or created a task between 10:00 PM and 4:00 AM.',
    secretHint: 'Forge productivity when the rest of the world sleeps.',
    tier: 'bronze',
    xp: 100,
    icon: '🦉',
    isHidden: true,
  },
  {
    id: 'early_bird',
    title: 'Dawn Patrol',
    description: 'Completed or created a task between 5:00 AM and 8:00 AM.',
    secretHint: 'Rise and shine before the morning rush.',
    tier: 'bronze',
    xp: 100,
    icon: '🌅',
    isHidden: true,
  },
  {
    id: 'palette_stylist',
    title: 'Chameleon',
    description: 'Switched your color palette 3 times.',
    secretHint: 'Try on different visual cloaks and aesthetics.',
    tier: 'bronze',
    xp: 100,
    icon: '🎨',
    isHidden: true,
  },
  {
    id: 'grand_champion',
    title: 'Grand Champion',
    description: 'Unlocked 8 or more achievements and reached Level 3.',
    secretHint: 'Ascend to the upper echelons of productivity glory.',
    tier: 'platinum',
    xp: 500,
    icon: '👑',
    isHidden: true,
  },
];

export function calculateLevel(xp: number): { level: number; title: string; currentTierXp: number; nextTierXp: number; progressPercent: number } {
  if (xp < 100) {
    return {
      level: 1,
      title: 'Task Apprentice',
      currentTierXp: xp,
      nextTierXp: 100,
      progressPercent: Math.min(100, Math.floor((xp / 100) * 100)),
    };
  } else if (xp < 300) {
    return {
      level: 2,
      title: 'Novice Organizer',
      currentTierXp: xp - 100,
      nextTierXp: 200,
      progressPercent: Math.min(100, Math.floor(((xp - 100) / 200) * 100)),
    };
  } else if (xp < 600) {
    return {
      level: 3,
      title: 'Flowstate Adept',
      currentTierXp: xp - 300,
      nextTierXp: 300,
      progressPercent: Math.min(100, Math.floor(((xp - 300) / 300) * 100)),
    };
  } else if (xp < 1000) {
    return {
      level: 4,
      title: 'Productivity Knight',
      currentTierXp: xp - 600,
      nextTierXp: 400,
      progressPercent: Math.min(100, Math.floor(((xp - 600) / 400) * 100)),
    };
  } else {
    return {
      level: 5,
      title: 'Grandmaster of Focus',
      currentTierXp: xp - 1000,
      nextTierXp: 500,
      progressPercent: 100,
    };
  }
}
