export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: Priority;
  category: string;
  tags: string[];
  dueDate: string; // Required date-time ISO string e.g. "2026-10-15T18:00"
  reminderMinutesBefore?: number;
  completed: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SortField = 'dueDate' | 'priority' | 'createdAt' | 'title' | 'category' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  order: SortOrder;
  label: string;
}

export type StatusFilter = 'all' | 'active' | 'completed';

export type DueDateQuickFilter = 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'all' | 'custom_range';

export interface CustomDateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface FilterOptions {
  status: StatusFilter;
  selectedCategories: string[]; // Multi-category selection
  selectedTag: string; // 'all' or specific tag
  priority: string; // 'all' or specific priority
  dueDateFilter: DueDateQuickFilter;
  customDateRange?: CustomDateRange;
  searchQuery: string;
}

export interface UserPreferences {
  userId: string;
  email: string;
  displayName?: string;
  theme?: string;
  palette?: string;
  xp?: number;
  level?: number;
  unlockedAchievements?: string[];
  singleUserMode?: boolean;
  allowedEmail?: string;
  updatedAt: string;
}
