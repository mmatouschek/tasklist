import React, { useState } from 'react';
import { Folder, Plus, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Task } from '../types/task';
import { TaskItem } from './TaskItem';

interface CategoryBoardViewProps {
  categories: string[];
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onQuickAddInCategory: (category: string) => void;
}

export const CategoryBoardView: React.FC<CategoryBoardViewProps> = ({
  categories,
  tasks,
  onEditTask,
  onQuickAddInCategory,
}) => {
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);

  // Group tasks by category
  const tasksByCategory: Record<string, Task[]> = {};
  categories.forEach((cat) => {
    tasksByCategory[cat] = [];
  });

  tasks.forEach((task) => {
    const cat = task.category?.trim() || 'General';
    if (tasksByCategory[cat]) {
      tasksByCategory[cat].push(task);
    } else if (categories.includes('Other') || categories.length === 0) {
      if (!tasksByCategory['Other']) tasksByCategory['Other'] = [];
      tasksByCategory['Other'].push(task);
    }
  });

  if (categories.length === 0) {
    return (
      <div
        className="p-8 rounded-2xl border text-center space-y-2"
        style={{
          backgroundColor: 'var(--app-bg-surface)',
          borderColor: 'var(--app-border-subtle)',
        }}
      >
        <Folder className="w-8 h-8 mx-auto text-slate-500" />
        <p className="text-sm font-semibold text-slate-300">No categories selected</p>
        <p className="text-xs text-slate-500">
          Select at least one category above to view tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mobile Category Tab Selector (< 768px) */}
      <div className="md:hidden flex items-center justify-between gap-2 p-1.5 rounded-xl border overflow-x-auto"
        style={{
          backgroundColor: 'var(--app-bg-surface)',
          borderColor: 'var(--app-border-subtle)',
        }}
      >
        {categories.map((cat, idx) => {
          const count = (tasksByCategory[cat] || []).length;
          const isActive = idx === mobileActiveIndex;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setMobileActiveIndex(idx)}
              className={`flex-1 min-w-[100px] px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center justify-center gap-1.5 border`}
              style={{
                backgroundColor: isActive ? 'var(--app-accent)' : 'transparent',
                color: isActive ? 'var(--app-accent-contrast)' : 'var(--app-text-secondary)',
                borderColor: isActive ? 'var(--app-accent)' : 'transparent',
              }}
            >
              <span className="truncate">{cat}</span>
              <span
                className="text-[10px] px-1.5 rounded-full font-bold"
                style={{
                  backgroundColor: isActive ? 'rgba(0,0,0,0.2)' : 'var(--app-bg-elevated)',
                  color: isActive ? 'inherit' : 'var(--app-text-primary)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop / Multi-Column Board Container */}
      <div className="grid grid-cols-1 md:grid-flow-col md:auto-cols-[minmax(300px,1fr)] gap-4 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((cat, idx) => {
          const categoryTasks = tasksByCategory[cat] || [];
          const isMobileVisible = idx === mobileActiveIndex;

          return (
            <div
              key={cat}
              className={`rounded-2xl border flex flex-col min-w-0 md:min-w-[320px] transition-all ${
                isMobileVisible ? 'block' : 'hidden md:flex'
              }`}
              style={{
                backgroundColor: 'var(--app-bg-surface)',
                borderColor: 'var(--app-border-subtle)',
              }}
            >
              {/* Column Header */}
              <div
                className="p-3.5 border-b flex items-center justify-between gap-2"
                style={{ borderColor: 'var(--app-border-subtle)' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{
                      backgroundColor: 'var(--app-accent-soft)',
                      color: 'var(--app-accent)',
                    }}
                  >
                    <Folder className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 truncate">
                    {cat}
                  </h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{
                      backgroundColor: 'var(--app-bg-elevated)',
                      color: 'var(--app-accent)',
                    }}
                  >
                    {categoryTasks.length}
                  </span>
                </div>

                {/* Quick Add In Column Button */}
                <button
                  type="button"
                  onClick={() => onQuickAddInCategory(cat)}
                  title={`Add task in ${cat}`}
                  className="p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--app-bg-elevated)',
                    borderColor: 'var(--app-border-subtle)',
                    color: 'var(--app-text-secondary)',
                  }}
                >
                  <Plus className="w-3.5 h-3.5" style={{ color: 'var(--app-accent)' }} />
                  <span className="hidden lg:inline text-[11px]">Add</span>
                </button>
              </div>

              {/* Tasks in Column */}
              <div className="p-3 space-y-2.5 flex-1 min-h-[150px] max-h-[70vh] overflow-y-auto">
                {categoryTasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                    <p>No tasks in {cat}</p>
                    <button
                      type="button"
                      onClick={() => onQuickAddInCategory(cat)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                      style={{
                        backgroundColor: 'var(--app-accent-soft)',
                        color: 'var(--app-accent)',
                      }}
                    >
                      + Add Task
                    </button>
                  </div>
                ) : (
                  categoryTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onEdit={onEditTask}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
