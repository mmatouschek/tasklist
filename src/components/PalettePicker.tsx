import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, ChevronDown } from 'lucide-react';
import { usePalette, COLOR_PALETTES } from '../context/PaletteContext';

export const PalettePicker: React.FC = () => {
  const { activePalette, setPaletteById } = usePalette();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition text-xs font-semibold"
        style={{
          backgroundColor: 'var(--app-bg-surface)',
          borderColor: 'var(--app-border-strong)',
          color: 'var(--app-text-primary)',
        }}
        title="Choose Color Palette"
      >
        {/* Color preview dots */}
        <div className="flex items-center -space-x-1">
          {activePalette.previewColors.map((col, idx) => (
            <span
              key={idx}
              className="w-3 h-3 rounded-full border border-black/30 shadow-xs"
              style={{ backgroundColor: col }}
            />
          ))}
        </div>
        <span className="hidden sm:inline">{activePalette.name.split(' (')[0]}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
          style={{
            backgroundColor: 'var(--app-bg-surface)',
            borderColor: 'var(--app-border-strong)',
          }}
        >
          <div className="px-3 py-2 border-b mb-1" style={{ borderColor: 'var(--app-border-subtle)' }}>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Color Palettes
            </p>
            <p className="text-[11px] text-slate-500">Select your preferred aesthetic</p>
          </div>

          <div className="space-y-1 max-h-80 overflow-y-auto">
            {COLOR_PALETTES.map((pal) => {
              const isSelected = pal.id === activePalette.id;
              return (
                <button
                  key={pal.id}
                  type="button"
                  onClick={() => {
                    setPaletteById(pal.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition ${
                    isSelected ? 'ring-1' : 'hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--app-bg-elevated)' : 'transparent',
                    outline: isSelected ? '1px solid var(--app-accent)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Swatch tri-dot */}
                    <div className="flex items-center -space-x-1">
                      {pal.previewColors.map((col, idx) => (
                        <span
                          key={idx}
                          className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs"
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        {pal.name}
                      </p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {pal.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check
                      className="w-4 h-4 shrink-0"
                      style={{ color: 'var(--app-accent)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
