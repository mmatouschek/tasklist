import React, { useState } from 'react';
import {
  Search,
  ArrowUpDown,
  Calendar,
  Clock,
  Folder,
  Tag,
  X,
  Filter,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  FilterOptions,
  SortOption,
  DueDateQuickFilter,
  Priority,
  CustomDateRange,
} from '../types/task';

interface FilterBarProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  sort: SortOption;
  setSort: React.Dispatch<React.SetStateAction<SortOption>>;
  categories: string[];
  tags: string[];
  counts: {
    all: number;
    active: number;
    completed: number;
    today: number;
    tomorrow: number;
    thisWeek: number;
    nextWeek: number;
  };
}

export const SORT_OPTIONS: SortOption[] = [
  { field: 'dueDate', order: 'asc', label: 'Due Date (Earliest first)' },
  { field: 'dueDate', order: 'desc', label: 'Due Date (Latest first)' },
  { field: 'priority', order: 'desc', label: 'Priority (Urgent → Low)' },
  { field: 'createdAt', order: 'desc', label: 'Date Created (Newest)' },
  { field: 'title', order: 'asc', label: 'Title (A → Z)' },
  { field: 'category', order: 'asc', label: 'Category (A → Z)' },
  { field: 'status', order: 'asc', label: 'Status (Active first)' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  sort,
  setSort,
  categories,
  tags,
  counts,
}) => {
  const [showCustomRangePicker, setShowCustomRangePicker] = useState(
    filters.dueDateFilter === 'custom_range'
  );

  const [customStart, setCustomStart] = useState(
    filters.customDateRange?.startDate || new Date().toISOString().slice(0, 10)
  );
  const [customEnd, setCustomEnd] = useState(
    filters.customDateRange?.endDate ||
      new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );

  const toggleCategory = (cat: string) => {
    setFilters((prev) => {
      const current = prev.selectedCategories;
      if (current.includes(cat)) {
        const next = current.filter((c) => c !== cat);
        return { ...prev, selectedCategories: next };
      } else {
        return { ...prev, selectedCategories: [...current, cat] };
      }
    });
  };

  const selectAllCategories = () => {
    setFilters((prev) => ({
      ...prev,
      selectedCategories: [...categories],
    }));
  };

  const clearCategories = () => {
    setFilters((prev) => ({
      ...prev,
      selectedCategories: [],
    }));
  };

  const applyCustomRange = () => {
    setFilters((prev) => ({
      ...prev,
      dueDateFilter: 'custom_range',
      customDateRange: { startDate: customStart, endDate: customEnd },
    }));
  };

  return (
    <div className="space-y-3.5">
      
      {/* 1. Quick Due-Date Filter Tabs (Required by prompt) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1 mr-1">
            <Clock className="w-3.5 h-3.5" style={{ color: 'var(--app-accent)' }} /> Due Date:
          </span>

          {[
            { id: 'today' as DueDateQuickFilter, label: 'Today', count: counts.today },
            { id: 'tomorrow' as DueDateQuickFilter, label: 'Tomorrow', count: counts.tomorrow },
            { id: 'this_week' as DueDateQuickFilter, label: 'This Week', count: counts.thisWeek },
            { id: 'next_week' as DueDateQuickFilter, label: 'Next Week', count: counts.nextWeek },
            { id: 'all' as DueDateQuickFilter, label: 'All Dates', count: counts.all },
            { id: 'custom_range' as DueDateQuickFilter, label: 'Calendar Range', count: null },
          ].map((tab) => {
            const isSelected = filters.dueDateFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'custom_range') {
                    setShowCustomRangePicker(true);
                  } else {
                    setShowCustomRangePicker(false);
                  }
                  setFilters((prev) => ({ ...prev, dueDateFilter: tab.id }));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 border`}
                style={{
                  backgroundColor: isSelected
                    ? 'var(--app-accent)'
                    : 'var(--app-bg-surface)',
                  color: isSelected
                    ? 'var(--app-accent-contrast)'
                    : 'var(--app-text-secondary)',
                  borderColor: isSelected
                    ? 'var(--app-accent)'
                    : 'var(--app-border-subtle)',
                }}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className="text-[10px] px-1.5 py-0.2 rounded-full font-bold"
                    style={{
                      backgroundColor: isSelected
                        ? 'rgba(0,0,0,0.2)'
                        : 'var(--app-bg-elevated)',
                      color: isSelected ? 'inherit' : 'var(--app-text-primary)',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status segmented buttons (All / Active / Completed) */}
        <div
          className="inline-flex rounded-xl p-0.5 border self-start sm:self-auto shrink-0"
          style={{
            backgroundColor: 'var(--app-bg-surface)',
            borderColor: 'var(--app-border-subtle)',
          }}
        >
          {(['all', 'active', 'completed'] as const).map((st) => {
            const isSelected = filters.status === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, status: st }))}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition`}
                style={{
                  backgroundColor: isSelected ? 'var(--app-bg-elevated)' : 'transparent',
                  color: isSelected ? 'var(--app-accent)' : 'var(--app-text-secondary)',
                }}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar Date Range Picker (if custom_range is selected) */}
      {showCustomRangePicker && (
        <div
          className="p-3.5 rounded-2xl border flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-150"
          style={{
            backgroundColor: 'var(--app-bg-surface)',
            borderColor: 'var(--app-accent)',
          }}
        >
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Select Calendar Date Range:</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border bg-slate-900 text-slate-200 border-slate-700 text-xs focus:outline-none"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border bg-slate-900 text-slate-200 border-slate-700 text-xs focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={applyCustomRange}
            className="px-3 py-1.5 rounded-lg font-bold text-slate-950 transition"
            style={{ backgroundColor: 'var(--app-accent)' }}
          >
            Apply Range
          </button>
        </div>
      )}

      {/* 2. Multi-Category Selector with Column Mode Notice */}
      <div
        className="p-3 rounded-2xl border space-y-2"
        style={{
          backgroundColor: 'var(--app-bg-surface)',
          borderColor: 'var(--app-border-subtle)',
        }}
      >
        <div className="flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-slate-200">Category Columns:</span>
            <span className="text-slate-400 text-[11px]">
              (Select multiple to view side-by-side columns)
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <button
              type="button"
              onClick={selectAllCategories}
              className="text-amber-400 hover:underline"
            >
              Select All
            </button>
            <span className="text-slate-600">•</span>
            <button
              type="button"
              onClick={clearCategories}
              className="text-slate-400 hover:underline"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Multi-select category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isChecked = filters.selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 border`}
                style={{
                  backgroundColor: isChecked
                    ? 'var(--app-accent-soft)'
                    : 'var(--app-bg-base)',
                  borderColor: isChecked
                    ? 'var(--app-accent)'
                    : 'var(--app-border-subtle)',
                  color: isChecked
                    ? 'var(--app-accent)'
                    : 'var(--app-text-secondary)',
                }}
              >
                {isChecked ? (
                  <CheckSquare className="w-3.5 h-3.5" />
                ) : (
                  <Square className="w-3.5 h-3.5 opacity-50" />
                )}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Search Bar + Sort dropdown + Tag & Priority filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            placeholder="Search tasks, descriptions, or tags..."
            className="w-full pl-8 pr-7 py-2 rounded-xl border text-xs focus:outline-none"
            style={{
              backgroundColor: 'var(--app-bg-surface)',
              borderColor: 'var(--app-border-subtle)',
              color: 'var(--app-text-primary)',
            }}
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative shrink-0">
          <select
            value={`${sort.field}_${sort.order}`}
            onChange={(e) => {
              const [f, o] = e.target.value.split('_');
              const matched = SORT_OPTIONS.find(
                (opt) => opt.field === f && opt.order === o
              );
              if (matched) setSort(matched);
            }}
            className="appearance-none pl-7 pr-8 py-2 rounded-xl border text-xs font-semibold cursor-pointer focus:outline-none"
            style={{
              backgroundColor: 'var(--app-bg-surface)',
              borderColor: 'var(--app-border-subtle)',
              color: 'var(--app-text-primary)',
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={`${opt.field}_${opt.order}`} value={`${opt.field}_${opt.order}`}>
                {opt.label}
              </option>
            ))}
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
