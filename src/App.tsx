import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  ListTodo,
  Sparkles,
  LogIn,
  AlertCircle,
  Bell,
  Trash2,
  Check,
  Calendar,
  Clock,
  Trophy,
  Award,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PaletteProvider } from './context/PaletteContext';
import { GamificationProvider, useGamification } from './context/GamificationContext';
import { Navbar } from './components/Navbar';
import { TaskInput } from './components/TaskInput';
import { TaskItem } from './components/TaskItem';
import { CategoryBoardView } from './components/CategoryBoardView';
import { FilterBar, SORT_OPTIONS } from './components/FilterBar';
import { AchievementsTab } from './components/AchievementsTab';
import { TaskEditModal } from './components/TaskEditModal';
import { GitHubPagesModal } from './components/GitHubPagesModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { SettingsModal } from './components/SettingsModal';
import { OwnerLockScreen } from './components/OwnerLockScreen';
import { Task, FilterOptions, SortOption, Priority, DueDateQuickFilter } from './types/task';
import { subscribeToTasks, bulkDeleteCompleted, getDefaultDueDateTime } from './services/taskService';
import {
  checkUpcomingDeadlines,
  UpcomingDeadlineAlert,
  getNotificationPermissionStatus,
  requestNotificationPermission,
} from './services/notificationService';

const MainApp: React.FC = () => {
  const { user, loading: authLoading, signInWithGoogle, isAuthorized, authError, clearAuthError } = useAuth();
  const { checkTasks, recentUnlocked, dismissUnlockToast } = useGamification();

  const [activeTab, setActiveTab] = useState<'tasks' | 'achievements'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Quick add in specific category state
  const [inputCategory, setInputCategory] = useState<string>('General');

  // Modals
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // In-app deadline toast
  const [activeAlerts, setActiveAlerts] = useState<UpcomingDeadlineAlert[]>([]);

  // Filter & Sort state
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    selectedCategories: ['General', 'Personal', 'Work'], // Multi-category default
    selectedTag: 'all',
    priority: 'all',
    dueDateFilter: 'today', // Default quick filter is today per prompt
    searchQuery: '',
  });

  const [sort, setSort] = useState<SortOption>(SORT_OPTIONS[0]);

  // Subscribe to tasks via Firestore onSnapshot
  useEffect(() => {
    if (!user || !isAuthorized) {
      setTasks([]);
      setLoadingTasks(false);
      return;
    }

    setLoadingTasks(true);
    const unsubscribe = subscribeToTasks(
      user.uid,
      (fetchedTasks) => {
        setTasks(fetchedTasks);
        setLoadingTasks(false);
        checkTasks(fetchedTasks);
      },
      (err) => {
        console.error('Task sync error:', err);
        setLoadingTasks(false);
      }
    );

    return () => unsubscribe();
  }, [user, isAuthorized]);

  // Deadline checker runs every 30 seconds
  useEffect(() => {
    if (!tasks.length) return;

    const runDeadlineCheck = () => {
      checkUpcomingDeadlines(tasks, (alert) => {
        setActiveAlerts((prev) => [alert, ...prev.slice(0, 4)]);
      });
    };

    runDeadlineCheck();
    const interval = setInterval(runDeadlineCheck, 30000);
    return () => clearInterval(interval);
  }, [tasks]);

  // Extract unique categories & tags
  const availableCategories = useMemo(() => {
    const set = new Set<string>(['General', 'Personal', 'Work']);
    tasks.forEach((t) => {
      if (t.category && t.category.trim()) set.add(t.category.trim());
    });
    return Array.from(set).sort();
  }, [tasks]);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.tags && Array.isArray(t.tags)) {
        t.tags.forEach((tag) => set.add(tag.toLowerCase()));
      }
    });
    return Array.from(set).sort();
  }, [tasks]);

  // Helper date checking functions
  const isDateToday = (isoDate: string) => {
    if (!isoDate) return false;
    const d = new Date(isoDate);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const isDateTomorrow = (isoDate: string) => {
    if (!isoDate) return false;
    const d = new Date(isoDate);
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    return (
      d.getFullYear() === tom.getFullYear() &&
      d.getMonth() === tom.getMonth() &&
      d.getDate() === tom.getDate()
    );
  };

  const isDateThisWeek = (isoDate: string) => {
    if (!isoDate) return false;
    const target = new Date(isoDate).getTime();
    const now = new Date();
    // Start of week (Monday)
    const day = now.getDay() || 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - day + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    // End of week (Sunday 23:59:59)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return target >= startOfWeek.getTime() && target <= endOfWeek.getTime();
  };

  const isDateNextWeek = (isoDate: string) => {
    if (!isoDate) return false;
    const target = new Date(isoDate).getTime();
    const now = new Date();
    const day = now.getDay() || 7;
    const startOfNextWeek = new Date(now);
    startOfNextWeek.setDate(now.getDate() - day + 8);
    startOfNextWeek.setHours(0, 0, 0, 0);

    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
    endOfNextWeek.setHours(23, 59, 59, 999);

    return target >= startOfNextWeek.getTime() && target <= endOfNextWeek.getTime();
  };

  const isDateInCustomRange = (isoDate: string, range?: { startDate: string; endDate: string }) => {
    if (!isoDate || !range?.startDate || !range?.endDate) return true;
    const target = new Date(isoDate).getTime();
    const start = new Date(range.startDate).setHours(0, 0, 0, 0);
    const end = new Date(range.endDate).setHours(23, 59, 59, 999);
    return target >= start && target <= end;
  };

  // Due date filter calculation
  const taskPassesDueDateFilter = (t: Task) => {
    if (!t.dueDate) return filters.dueDateFilter === 'all';
    switch (filters.dueDateFilter) {
      case 'today':
        return isDateToday(t.dueDate);
      case 'tomorrow':
        return isDateTomorrow(t.dueDate);
      case 'this_week':
        return isDateThisWeek(t.dueDate);
      case 'next_week':
        return isDateNextWeek(t.dueDate);
      case 'custom_range':
        return isDateInCustomRange(t.dueDate, filters.customDateRange);
      case 'all':
      default:
        return true;
    }
  };

  // Counts for tabs & date filters
  const counts = useMemo(() => {
    return {
      all: tasks.length,
      active: tasks.filter((t) => !t.completed).length,
      completed: tasks.filter((t) => t.completed).length,
      today: tasks.filter((t) => isDateToday(t.dueDate)).length,
      tomorrow: tasks.filter((t) => isDateTomorrow(t.dueDate)).length,
      thisWeek: tasks.filter((t) => isDateThisWeek(t.dueDate)).length,
      nextWeek: tasks.filter((t) => isDateNextWeek(t.dueDate)).length,
    };
  }, [tasks]);

  const priorityWeight: Record<Priority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  // Filtered & Sorted tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Status filter
    if (filters.status === 'active') {
      result = result.filter((t) => !t.completed);
    } else if (filters.status === 'completed') {
      result = result.filter((t) => t.completed);
    }

    // Due Date quick filter
    result = result.filter(taskPassesDueDateFilter);

    // Multi-Category filter
    if (filters.selectedCategories.length > 0) {
      result = result.filter((t) =>
        filters.selectedCategories.includes(t.category?.trim() || 'General')
      );
    }

    // Tag filter
    if (filters.selectedTag !== 'all') {
      result = result.filter(
        (t) => t.tags && t.tags.map((x) => x.toLowerCase()).includes(filters.selectedTag.toLowerCase())
      );
    }

    // Priority filter
    if (filters.priority !== 'all') {
      result = result.filter((t) => t.priority === filters.priority);
    }

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q))) ||
          t.category.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sort.field) {
        case 'dueDate': {
          const timeA = new Date(a.dueDate).getTime() || 0;
          const timeB = new Date(b.dueDate).getTime() || 0;
          return sort.order === 'asc' ? timeA - timeB : timeB - timeA;
        }
        case 'priority': {
          const wA = priorityWeight[a.priority] || 0;
          const wB = priorityWeight[b.priority] || 0;
          return sort.order === 'asc' ? wA - wB : wB - wA;
        }
        case 'createdAt': {
          const tA = new Date(a.createdAt).getTime();
          const tB = new Date(b.createdAt).getTime();
          return sort.order === 'asc' ? tA - tB : tB - tA;
        }
        case 'title': {
          const comp = a.title.localeCompare(b.title);
          return sort.order === 'asc' ? comp : -comp;
        }
        case 'category': {
          const comp = (a.category || '').localeCompare(b.category || '');
          return sort.order === 'asc' ? comp : -comp;
        }
        case 'status': {
          const statA = a.completed ? 1 : 0;
          const statB = b.completed ? 1 : 0;
          return sort.order === 'asc' ? statA - statB : statB - statA;
        }
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, filters, sort]);

  const handleClearCompleted = async () => {
    const completedIds = tasks.filter((t) => t.completed).map((t) => t.id);
    if (!completedIds.length) return;
    if (window.confirm(`Clear all ${completedIds.length} completed task(s)?`)) {
      await bulkDeleteCompleted(completedIds);
    }
  };

  // If user is logged in but fails single-user lock
  if (user && !isAuthorized) {
    return <OwnerLockScreen />;
  }

  return (
    <div
      className="min-h-screen flex flex-col transition-colors selection:bg-amber-500 selection:text-slate-950"
      style={{
        backgroundColor: 'var(--app-bg-base)',
        color: 'var(--app-text-primary)',
      }}
    >
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNotifications={() => setShowNotificationModal(true)}
        onOpenGitHubPages={() => setShowGitHubModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Floating Trophy Unlock Alert (Gamification Notification) */}
      {recentUnlocked && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
          <div
            className="p-4 rounded-2xl border shadow-2xl flex items-start justify-between gap-3"
            style={{
              backgroundColor: 'var(--app-bg-surface)',
              borderColor: 'var(--app-accent)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 border"
                style={{
                  backgroundColor: 'var(--app-accent-soft)',
                  borderColor: 'var(--app-accent)',
                }}
              >
                {recentUnlocked.icon}
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> Trophy Unlocked!
                </span>
                <p className="text-sm font-bold text-slate-100">{recentUnlocked.title}</p>
                <p className="text-xs text-slate-300">{recentUnlocked.description}</p>
                <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 font-mono mt-1">
                  +{recentUnlocked.xp} XP Earned
                </span>
              </div>
            </div>
            <button
              onClick={dismissUnlockToast}
              className="text-slate-400 hover:text-slate-100 p-1 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Floating Deadline Alerts */}
      {activeAlerts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
          {activeAlerts.map((alert, idx) => (
            <div
              key={`${alert.task.id}-${idx}`}
              className="pointer-events-auto p-3.5 rounded-xl text-white shadow-xl border flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200"
              style={{
                backgroundColor: 'var(--app-bg-surface)',
                borderColor: 'var(--app-accent)',
              }}
            >
              <div className="flex items-start gap-2.5">
                <Bell className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-amber-300">Upcoming Deadline Alert</p>
                  <p className="font-medium text-slate-200 line-clamp-1">{alert.task.title}</p>
                  <p className="text-slate-400 text-[11px]">{alert.formattedTimeRemaining}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveAlerts((prev) => prev.filter((_, i) => i !== idx))}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8 space-y-6">
        
        {/* Auth Error Banner if any */}
        {authError && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-xs text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
            <button onClick={clearAuthError} className="font-semibold underline ml-2">Dismiss</button>
          </div>
        )}

        {/* If Not Authenticated: Inviting Hero Banner */}
        {!user && !authLoading && (
          <div
            className="p-6 md:p-8 rounded-3xl border shadow-xl relative overflow-hidden"
            style={{
              backgroundColor: 'var(--app-bg-surface)',
              borderColor: 'var(--app-border-strong)',
            }}
          >
            <div className="relative z-10 max-w-lg space-y-4">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: 'var(--app-accent-soft)',
                  color: 'var(--app-accent)',
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Gamified Real-Time Productivity
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100">
                Organize quests, defeat deadlines, unlock trophies.
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Sign in to manage tasks in multi-category columns, quick-filter by due dates, earn achievements, and sync in real-time. Ready to deploy freely on GitHub Pages.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2.5 shadow-lg transition active:scale-95"
                  style={{
                    backgroundColor: 'var(--app-accent)',
                    color: 'var(--app-accent-contrast)',
                  }}
                >
                  <LogIn className="w-4 h-4 stroke-[3]" />
                  Sign in with Google to Begin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: ACHIEVEMENTS TAB */}
        {user && activeTab === 'achievements' && <AchievementsTab />}

        {/* TAB 2: TASKS TAB */}
        {user && activeTab === 'tasks' && (
          <div className="space-y-5">
            {/* Task Creation Input */}
            <TaskInput
              availableCategories={availableCategories}
              availableTags={availableTags}
              initialCategory={inputCategory}
            />

            {/* Filter and Due-Date Bar */}
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              sort={sort}
              setSort={setSort}
              categories={availableCategories}
              tags={availableTags}
              counts={counts}
            />

            {/* Task Display Area: Multi-Category Column View */}
            {loadingTasks ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <div
                  className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto"
                  style={{ borderColor: 'var(--app-accent)' }}
                />
                <p className="text-xs">Synchronizing quests with Firebase...</p>
              </div>
            ) : filteredAndSortedTasks.length === 0 ? (
              <div
                className="py-16 text-center rounded-2xl border-2 border-dashed p-8 space-y-3"
                style={{
                  backgroundColor: 'var(--app-bg-surface)',
                  borderColor: 'var(--app-border-subtle)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--app-accent-soft)',
                    color: 'var(--app-accent)',
                  }}
                >
                  <ListTodo className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-200">
                    {tasks.length === 0 ? 'No quests forged yet' : 'No matching quests found'}
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    {tasks.length === 0
                      ? 'Add your first task above to earn your First Step trophy!'
                      : 'Try switching your due date filter or resetting category selections.'}
                  </p>
                </div>
              </div>
            ) : (
              <CategoryBoardView
                categories={
                  filters.selectedCategories.length > 0
                    ? filters.selectedCategories
                    : availableCategories
                }
                tasks={filteredAndSortedTasks}
                onEditTask={(t) => setEditingTask(t)}
                onQuickAddInCategory={(cat) => {
                  setInputCategory(cat);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* Clear Completed Action */}
            {counts.completed > 0 && (
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{counts.completed} completed quest(s)</span>
                <button
                  type="button"
                  onClick={handleClearCompleted}
                  className="flex items-center gap-1 text-rose-400 hover:underline transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear completed
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Task Modal */}
      <TaskEditModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        availableCategories={availableCategories}
        availableTags={availableTags}
      />

      {/* GitHub Pages Modal */}
      <GitHubPagesModal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
      />

      {/* Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onOpenNotifications={() => setShowNotificationModal(true)}
        onOpenGitHubPages={() => setShowGitHubModal(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <PaletteProvider>
      <AuthProvider>
        <GamificationProvider>
          <MainApp />
        </GamificationProvider>
      </AuthProvider>
    </PaletteProvider>
  );
}
