import React, { useState, useEffect } from 'react';
import {
  Plus,
  Calendar,
  Tag,
  Folder,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { Priority } from '../types/task';
import { createTask, CreateTaskInput, getDefaultDueDateTime } from '../services/taskService';
import { useAuth } from '../context/AuthContext';

interface TaskInputProps {
  availableCategories: string[];
  availableTags: string[];
  initialCategory?: string;
  onTaskCreated?: () => void;
}

export const TaskInput: React.FC<TaskInputProps> = ({
  availableCategories,
  availableTags,
  initialCategory = 'General',
  onTaskCreated,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState(initialCategory);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  // Due date required and set to today by default
  const [dueDate, setDueDate] = useState<string>(getDefaultDueDateTime());
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (clean && !tags.includes(clean) && tags.length < 10) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const setPresetDate = (daysAhead: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);
    target.setHours(18, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatted = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(target.getHours())}:${pad(target.getMinutes())}`;
    setDueDate(formatted);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !user || loading) return;

    if (!dueDate) {
      setError('Due date is required. Please pick a deadline.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const input: CreateTaskInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category: category.trim() || 'General',
        tags,
        dueDate: dueDate,
        reminderMinutesBefore: reminderMinutes,
      };

      await createTask(user.uid, input);

      // Reset
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(getDefaultDueDateTime());
      setTags([]);
      setTagInput('');
      setShowAdvanced(false);

      if (onTaskCreated) onTaskCreated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create task';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-2xl border shadow-sm p-4 transition-all"
      style={{
        backgroundColor: 'var(--app-bg-surface)',
        borderColor: 'var(--app-border-strong)',
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Main Title Row */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Forge a new task... (press Enter to create)"
            maxLength={200}
            className="flex-1 bg-transparent px-3 py-2 text-sm md:text-base font-medium placeholder-slate-500 focus:outline-none"
            style={{ color: 'var(--app-text-primary)' }}
          />

          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="h-10 px-4 rounded-xl font-bold text-xs md:text-sm flex items-center gap-1.5 transition shadow-sm shrink-0 disabled:opacity-40"
            style={{
              backgroundColor: 'var(--app-accent)',
              color: 'var(--app-accent-contrast)',
            }}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Add Quest</span>
          </button>
        </div>

        {/* Quick Toolbar */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs"
          style={{ borderColor: 'var(--app-border-subtle)' }}
        >
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority Selector */}
            <div
              className="inline-flex rounded-lg p-0.5 border"
              style={{
                backgroundColor: 'var(--app-bg-base)',
                borderColor: 'var(--app-border-subtle)',
              }}
            >
              {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => {
                const active = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition ${
                      active
                        ? p === 'urgent'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : p === 'high'
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                          : p === 'medium'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Quick Due Date Presets */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-0.5">
                <Clock className="w-3 h-3 text-amber-400" /> Due:
              </span>
              <button
                type="button"
                onClick={() => setPresetDate(0)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition`}
                style={{
                  backgroundColor: dueDate.includes(new Date().toISOString().slice(0, 10))
                    ? 'var(--app-accent-soft)'
                    : 'var(--app-bg-base)',
                  borderColor: dueDate.includes(new Date().toISOString().slice(0, 10))
                    ? 'var(--app-accent)'
                    : 'var(--app-border-subtle)',
                  color: dueDate.includes(new Date().toISOString().slice(0, 10))
                    ? 'var(--app-accent)'
                    : 'var(--app-text-secondary)',
                }}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setPresetDate(1)}
                className="px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition border-slate-700 hover:bg-slate-800 text-slate-400"
              >
                Tomorrow
              </button>
            </div>
          </div>

          {/* Toggle More Details */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-[11px] font-semibold transition ml-auto"
            style={{ color: 'var(--app-accent)' }}
          >
            <span>{showAdvanced ? 'Fewer options' : 'More options'}</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Advanced Drawer */}
        {showAdvanced && (
          <div
            className="pt-3 border-t space-y-3 animate-in fade-in duration-150"
            style={{ borderColor: 'var(--app-border-subtle)' }}
          >
            {/* Description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quest notes, checklist, or instructions..."
              rows={2}
              maxLength={2000}
              className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none resize-none"
              style={{
                backgroundColor: 'var(--app-bg-base)',
                borderColor: 'var(--app-border-subtle)',
                color: 'var(--app-text-primary)',
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Category */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Folder className="w-3 h-3 text-amber-400" /> Category *
                </label>
                <input
                  type="text"
                  list="input-categories"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Work, Personal"
                  maxLength={50}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--app-bg-base)',
                    borderColor: 'var(--app-border-subtle)',
                    color: 'var(--app-text-primary)',
                  }}
                />
                <datalist id="input-categories">
                  {Array.from(new Set([...availableCategories, 'General', 'Work', 'Personal', 'Shopping', 'Health', 'Finance'])).map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              {/* Exact Due Date & Time (Required) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" /> Deadline * (Required)
                </label>
                <input
                  type="datetime-local"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--app-bg-base)',
                    borderColor: 'var(--app-border-subtle)',
                    color: 'var(--app-text-primary)',
                  }}
                />
              </div>

              {/* Reminder Lead Time */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" /> Push Alert Before
                </label>
                <select
                  value={reminderMinutes}
                  onChange={(e) => setReminderMinutes(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg border text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--app-bg-base)',
                    borderColor: 'var(--app-border-subtle)',
                    color: 'var(--app-text-primary)',
                  }}
                >
                  <option value={0}>At deadline</option>
                  <option value={5}>5 min before</option>
                  <option value={15}>15 min before</option>
                  <option value={30}>30 min before</option>
                  <option value={60}>1 hour before</option>
                  <option value={1440}>1 day before</option>
                </select>
              </div>
            </div>

            {/* Tags input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-400" /> Tags
              </label>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium"
                    style={{
                      backgroundColor: 'var(--app-accent-soft)',
                      color: 'var(--app-accent)',
                    }}
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-400 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tag and press Enter..."
                  className="flex-1 px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--app-bg-base)',
                    borderColor: 'var(--app-border-subtle)',
                    color: 'var(--app-text-primary)',
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1 rounded-lg border text-xs font-semibold text-slate-300"
                  style={{
                    backgroundColor: 'var(--app-bg-elevated)',
                    borderColor: 'var(--app-border-subtle)',
                  }}
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-xs text-rose-400 flex items-center gap-1 pt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>
    </div>
  );
};
