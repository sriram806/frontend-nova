'use client';

import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

type ThemeMode = 'dark' | 'light';

type UiState = {
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  rightPanelOpen: boolean;
  rightPanelTab: 'context' | 'output' | 'activity';
  commandPaletteOpen: boolean;
  commandQuery: string;

  setTheme: (theme: ThemeMode) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleRightPanel: () => void;
  setRightPanelOpen: (open: boolean) => void;
  setRightPanelTab: (tab: 'context' | 'output' | 'activity') => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setCommandQuery: (query: string) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      rightPanelOpen: true,
      rightPanelTab: 'context',
      commandPaletteOpen: false,
      commandQuery: '',

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
      setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
      setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
      setCommandPaletteOpen: (open) =>
        set((state) => ({
          commandPaletteOpen: open,
          commandQuery: open ? state.commandQuery : '',
        })),
      setCommandQuery: (query) => set({ commandQuery: query }),
    }),
    {
      name: 'think-ai-ui',
      storage: createJSONStorage(() => (typeof window === 'undefined' ? noopStorage : localStorage)),
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        rightPanelOpen: state.rightPanelOpen,
        rightPanelTab: state.rightPanelTab,
      }),
    }
  )
);
