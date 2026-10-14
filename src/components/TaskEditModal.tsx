import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, Folder, AlertCircle, Trash2 } from 'lucide-react';
import { Task, Priority } from '../types/task';
import { updateTask, deleteTask, getDefaultDueDateTime } from '../services/taskService';

interface TaskEditModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  availableCategories: string[];
  availableTags: string[];
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  isOpen,
  onClose,
  availableCategories,
  availableTags,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('General');
  const [customCategory, setCustomCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState<number>(15);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setCategory(task.category || 'General');
      setCustomCategory('');
      setTags(task.tags || []);
      setTagInput('');
      setDueDate(task.dueDate || getDefaultDueDateTime());
      setReminderMinutes(task.reminderMinutesBefore ?? 15);
      setConfirmDelete(false);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (clean && !tags.includes(clean) && tags.length < 10) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const finalCategory = customCategory.trim() || category;
      await updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        category: finalCategory,
        tags,
        dueDate: dueDate || getDefaultDueDateTime(),
        reminderMinutesBefore: reminderMinutes,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border p-6 md:p-7"
        style={{
          backgroundColor: 'var(--app-bg-surface)',
          borderColor: 'var(--app-border-strong)',
          color: 'var(--app-text-primary)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between pb-4 border-b"
          style={{ borderColor: 'var(--app-border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                priority === 'urgent'
                  ? 'bg-rose-500'
                  : priority === 'high'
                  ? 'bg-amber-500'
                  : priority === 'medium'
                  ? 'bg-blue-500'
                  : 'bg-emerald-500'
              }`}
            />
            <h2 className="text-lg font-bold">Edit Quest Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder="What needs to be accomplished?"
              className="w-full px-3.5 py-2.5 rounded-xl border font-medium text-sm focus:outline-none"
              style={{
                backgroundColor: 'var(--app-bg-base)',
                borderColor: 'var(--app-border-subtle)',
                color: 'var(--app-text-primary)',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Notes & Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Additional details, checklist, or links..."
              className="w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none resize-none"
              style={{
                backgroundColor: 'var(--app-bg-base)',
                borderColor: 'var(--app-border-subtle)',
                color: 'var(--app-text-primary)',
              }}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold capitalize border transition ${
                      isSelected
                        ? p === 'urgent'
                          ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                          : p === 'high'
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-sm'
                          : p === 'medium'
                          ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                          : 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (e.target.value !== 'custom') setCustomCategory('');
                }}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--app-bg-base)',
                  borderColor: 'var(--app-border-subtle)',
                  color: 'var(--app-text-primary)',
                }}
              >
                {Array.from(new Set([...availableCategories, 'General', 'Work', 'Personal', 'Shopping', 'Health'])).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="custom">+ New Category...</option>
              </select>
            </div>

            {category === 'custom' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  New Category Name
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Finance"
                  maxLength={50}
                  className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                  style={{
                    backgroundColor: 'var(--app-bg-base)',
                    borderColor: 'var(--app-border-subtle)',
                    color: 'var(--app-text-primary)',
                  }}
                />
              </div>
            )}
          </div>

          {/* Due Date & Reminder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Deadline * (Required)
              </label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                style={{
                  backgroundColor: 'var(--app-bg-base)',
                  borderColor: 'var(--app-border-subtle)',
                  color: 'var(--app-text-primary)',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Alert Beforehand
              </label>
              <select
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                style={{
                  backgroundColor: 'var(--app-bg-base)',
                  borderColor: 'var(--app-border-subtle)',
                  color: 'var(--app-text-primary)',
                }}
              >
                <option value={0}>At deadline</option>
                <option value={5}>5 minutes before</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
                <option value={1440}>1 day before</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400" /> Tags (up to 10)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: 'var(--app-accent-soft)',
                    color: 'var(--app-accent)',
                  }}
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
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
                placeholder="Add a tag..."
                maxLength={30}
                className="flex-1 px-3 py-1.5 rounded-xl border text-xs focus:outline-none"
                style={{
                  backgroundColor: 'var(--app-bg-base)',
                  borderColor: 'var(--app-border-subtle)',
                  color: 'var(--app-text-primary)',
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl border text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--app-bg-elevated)',
                  borderColor: 'var(--app-border-subtle)',
                }}
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className="pt-4 border-t flex items-center justify-between"
            style={{ borderColor: 'var(--app-border-subtle)' }}
          >
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/40 transition text-xs flex items-center gap-1.5 font-semibold"
              >
                <Trash2 className="w-4 h-4" /> Delete Quest
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
                style={{ borderColor: 'var(--app-border-subtle)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !title.trim() || !dueDate}
                className="px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--app-accent)',
                  color: 'var(--app-accent-contrast)',
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
