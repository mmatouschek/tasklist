import React from 'react';
import {
  Check,
  Calendar,
  Clock,
  Tag,
  Edit3,
  Trash2,
  AlertTriangle,
  Folder,
  Bell,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, Priority } from '../types/task';
import { toggleTaskCompleted, deleteTask } from '../services/taskService';
import { playNotificationChime } from '../services/notificationService';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onSelectCategory?: (category: string) => void;
  onSelectTag?: (tag: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onEdit,
  onSelectCategory,
  onSelectTag,
}) => {
  const handleToggle = async () => {
    const nextState = !task.completed;
    if (nextState) {
      playNotificationChime();
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#f59e0b', '#06b6d4', '#10b981', '#f43f5e'],
      });
    }
    await toggleTaskCompleted(task.id, nextState);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this quest item?')) {
      await deleteTask(task.id);
    }
  };

  // Due date calculations
  const getDueBadge = () => {
    if (!task.dueDate) return null;
    const dueTime = new Date(task.dueDate).getTime();
    if (isNaN(dueTime)) return null;

    const diffMinutes = Math.round((dueTime - Date.now()) / 60000);
    const dueDateObj = new Date(task.dueDate);

    const isToday =
      new Date().toDateString() === dueDateObj.toDateString();

    const timeStr = dueDateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const dateStr = dueDateObj.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });

    if (task.completed) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
          <Calendar className="w-3 h-3" />
          {isToday ? `Today, ${timeStr}` : `${dateStr}, ${timeStr}`}
        </span>
      );
    }

    if (diffMinutes < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-800/60">
          <AlertTriangle className="w-3 h-3" />
          Overdue ({Math.abs(diffMinutes) > 60 ? `${Math.floor(Math.abs(diffMinutes) / 60)}h ago` : `${Math.abs(diffMinutes)}m ago`})
        </span>
      );
    } else if (diffMinutes <= 60) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/60">
          <Clock className="w-3 h-3" />
          Due in {diffMinutes}m ({timeStr})
        </span>
      );
    } else if (isToday) {
      return (
        <span
          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border"
          style={{
            backgroundColor: 'var(--app-accent-soft)',
            borderColor: 'var(--app-accent)',
            color: 'var(--app-accent)',
          }}
        >
          <Clock className="w-3 h-3" />
          Today at {timeStr}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
          <Calendar className="w-3 h-3" />
          {dateStr} at {timeStr}
        </span>
      );
    }
  };

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-rose-300 bg-rose-950/70 border-rose-800/80';
      case 'high':
        return 'text-amber-300 bg-amber-950/70 border-amber-800/80';
      case 'medium':
        return 'text-blue-300 bg-blue-950/70 border-blue-800/80';
      case 'low':
      default:
        return 'text-slate-300 bg-slate-800/70 border-slate-700/80';
    }
  };

  return (
    <div
      className={`group relative rounded-2xl p-4 transition-all border ${
        task.completed
          ? 'opacity-65'
          : 'shadow-xs hover:shadow-md'
      }`}
      style={{
        backgroundColor: task.completed ? 'var(--app-bg-base)' : 'var(--app-bg-surface)',
        borderColor: task.completed ? 'var(--app-border-subtle)' : 'var(--app-border-strong)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox button */}
        <button
          type="button"
          onClick={handleToggle}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
            task.completed
              ? 'text-slate-950 font-bold shadow-xs'
              : 'border-2 border-slate-600 hover:border-amber-400'
          }`}
          style={{
            backgroundColor: task.completed ? 'var(--app-accent)' : 'transparent',
          }}
        >
          {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Task Core Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              onClick={() => onEdit(task)}
              className={`text-sm md:text-base font-bold cursor-pointer break-words transition ${
                task.completed
                  ? 'line-through text-slate-500'
                  : 'text-slate-100 hover:opacity-85'
              }`}
            >
              {task.title}
            </h3>

            {/* Priority Badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityStyle(
                task.priority
              )}`}
            >
              {task.priority}
            </span>

            {/* Category Pill */}
            {task.category && (
              <button
                type="button"
                onClick={() => onSelectCategory && onSelectCategory(task.category)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition"
                style={{
                  backgroundColor: 'var(--app-bg-elevated)',
                  borderColor: 'var(--app-border-subtle)',
                  color: 'var(--app-text-secondary)',
                }}
              >
                <Folder className="w-2.5 h-2.5 opacity-60" />
                {task.category}
              </button>
            )}

            {/* Reminder Indicator */}
            {task.dueDate && task.reminderMinutesBefore !== undefined && (
              <span
                title={`Reminder alert set for ${task.reminderMinutesBefore}m before deadline`}
                className="inline-flex items-center text-slate-500"
              >
                <Bell className="w-3 h-3" />
              </span>
            )}
          </div>

          {/* Description snippet */}
          {task.description && (
            <p
              onClick={() => onEdit(task)}
              className={`text-xs mt-1.5 line-clamp-2 cursor-pointer ${
                task.completed
                  ? 'text-slate-600 line-through'
                  : 'text-slate-400'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Bottom metadata row: Due date badge + tags */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            {getDueBadge()}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                {task.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onSelectTag && onSelectTag(tag)}
                    className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded font-medium transition"
                    style={{
                      backgroundColor: 'var(--app-accent-soft)',
                      color: 'var(--app-accent)',
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <button
            type="button"
            onClick={() => onEdit(task)}
            title="Edit quest"
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            title="Delete quest"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
