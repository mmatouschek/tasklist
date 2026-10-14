import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  previewColors: string[];
  vars: {
    bgBase: string;
    bgSurface: string;
    bgElevated: string;
    borderSubtle: string;
    borderStrong: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    accentHover: string;
    accentSoft: string;
    accentContrast: string;
  };
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'warm-slate',
    name: 'Warm Slate & Amber (Default)',
    description: 'Dark, warm slate-gray with an inviting amber glow',
    isDark: true,
    previewColors: ['#14151b', '#1e2029', '#f59e0b'],
    vars: {
      bgBase: '#14151b',
      bgSurface: '#1e2029',
      bgElevated: '#282b37',
      borderSubtle: 'rgba(255, 255, 255, 0.08)',
      borderStrong: 'rgba(255, 255, 255, 0.16)',
      textPrimary: '#f3f4f6',
      textSecondary: '#9ca3af',
      accent: '#f59e0b',
      accentHover: '#d97706',
      accentSoft: 'rgba(245, 158, 11, 0.16)',
      accentContrast: '#0f172a',
    },
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    description: 'Arctic deep blue with an icy cyan accent',
    isDark: true,
    previewColors: ['#0b1329', '#152243', '#06b6d4'],
    vars: {
      bgBase: '#0b1329',
      bgSurface: '#131e3b',
      bgElevated: '#1c2b53',
      borderSubtle: 'rgba(56, 189, 248, 0.12)',
      borderStrong: 'rgba(56, 189, 248, 0.22)',
      textPrimary: '#f0f9ff',
      textSecondary: '#94a3b8',
      accent: '#06b6d4',
      accentHover: '#0891b2',
      accentSoft: 'rgba(6, 182, 212, 0.18)',
      accentContrast: '#082f49',
    },
  },
  {
    id: 'midnight-indigo',
    name: 'Midnight Indigo',
    description: 'Deep midnight obsidian with electric indigo',
    isDark: true,
    previewColors: ['#0b0d1b', '#161933', '#6366f1'],
    vars: {
      bgBase: '#0b0d1b',
      bgSurface: '#151830',
      bgElevated: '#202447',
      borderSubtle: 'rgba(99, 102, 241, 0.12)',
      borderStrong: 'rgba(99, 102, 241, 0.22)',
      textPrimary: '#f5f3ff',
      textSecondary: '#a5b4fc',
      accent: '#6366f1',
      accentHover: '#4f46e5',
      accentSoft: 'rgba(99, 102, 241, 0.18)',
      accentContrast: '#ffffff',
    },
  },
  {
    id: 'emerald-sanctuary',
    name: 'Emerald Forest',
    description: 'Dark pine & moss with refreshing emerald glow',
    isDark: true,
    previewColors: ['#091510', '#12251d', '#10b981'],
    vars: {
      bgBase: '#091510',
      bgSurface: '#12241d',
      bgElevated: '#1a332a',
      borderSubtle: 'rgba(16, 185, 129, 0.12)',
      borderStrong: 'rgba(16, 185, 129, 0.22)',
      textPrimary: '#ecfdf5',
      textSecondary: '#a7f3d0',
      accent: '#10b981',
      accentHover: '#059669',
      accentSoft: 'rgba(16, 185, 129, 0.18)',
      accentContrast: '#022c22',
    },
  },
  {
    id: 'obsidian-rose',
    name: 'Obsidian & Rose',
    description: 'Sleek dark wine with vibrant coral rose',
    isDark: true,
    previewColors: ['#140f16', '#221926', '#f43f5e'],
    vars: {
      bgBase: '#140f16',
      bgSurface: '#211825',
      bgElevated: '#2e2233',
      borderSubtle: 'rgba(244, 63, 94, 0.12)',
      borderStrong: 'rgba(244, 63, 94, 0.22)',
      textPrimary: '#fff1f2',
      textSecondary: '#fda4af',
      accent: '#f43f5e',
      accentHover: '#e11d48',
      accentSoft: 'rgba(244, 63, 94, 0.18)',
      accentContrast: '#ffffff',
    },
  },
  {
    id: 'sandstone-editorial',
    name: 'Sandstone & Terracotta (Warm Light)',
    description: 'Inviting off-white paper with terracotta orange accent',
    isDark: false,
    previewColors: ['#f9f8f5', '#ffffff', '#ea580c'],
    vars: {
      bgBase: '#f9f8f5',
      bgSurface: '#ffffff',
      bgElevated: '#f1ede4',
      borderSubtle: 'rgba(0, 0, 0, 0.08)',
      borderStrong: 'rgba(0, 0, 0, 0.15)',
      textPrimary: '#1c1917',
      textSecondary: '#57534e',
      accent: '#ea580c',
      accentHover: '#c2410c',
      accentSoft: 'rgba(234, 88, 12, 0.12)',
      accentContrast: '#ffffff',
    },
  },
];

interface PaletteContextType {
  activePalette: ColorPalette;
  setPaletteById: (id: string) => void;
  availablePalettes: ColorPalette[];
  paletteSwitchesCount: number;
}

const PaletteContext = createContext<PaletteContextType | undefined>(undefined);

export const PaletteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paletteId, setPaletteId] = useState<string>(() => {
    return localStorage.getItem('taskpulse_palette') || 'warm-slate';
  });

  const [paletteSwitchesCount, setPaletteSwitchesCount] = useState<number>(() => {
    const raw = localStorage.getItem('taskpulse_palette_switches');
    return raw ? Number(raw) : 0;
  });

  const activePalette = COLOR_PALETTES.find((p) => p.id === paletteId) || COLOR_PALETTES[0];

  useEffect(() => {
    const root = document.documentElement;
    const { vars, isDark } = activePalette;

    root.style.setProperty('--app-bg-base', vars.bgBase);
    root.style.setProperty('--app-bg-surface', vars.bgSurface);
    root.style.setProperty('--app-bg-elevated', vars.bgElevated);
    root.style.setProperty('--app-border-subtle', vars.borderSubtle);
    root.style.setProperty('--app-border-strong', vars.borderStrong);
    root.style.setProperty('--app-text-primary', vars.textPrimary);
    root.style.setProperty('--app-text-secondary', vars.textSecondary);
    root.style.setProperty('--app-accent', vars.accent);
    root.style.setProperty('--app-accent-hover', vars.accentHover);
    root.style.setProperty('--app-accent-soft', vars.accentSoft);
    root.style.setProperty('--app-accent-contrast', vars.accentContrast);

    // Keep Tailwind dark class synced for libraries/inputs
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', vars.bgBase);
    }
  }, [activePalette]);

  const setPaletteById = (id: string) => {
    if (id !== paletteId) {
      setPaletteId(id);
      localStorage.setItem('taskpulse_palette', id);
      const newCount = paletteSwitchesCount + 1;
      setPaletteSwitchesCount(newCount);
      localStorage.setItem('taskpulse_palette_switches', String(newCount));
    }
  };

  return (
    <PaletteContext.Provider
      value={{
        activePalette,
        setPaletteById,
        availablePalettes: COLOR_PALETTES,
        paletteSwitchesCount,
      }}
    >
      {children}
    </PaletteContext.Provider>
  );
};

export const usePalette = () => {
  const context = useContext(PaletteContext);
  if (!context) {
    throw new Error('usePalette must be used within PaletteProvider');
  }
  return context;
};
