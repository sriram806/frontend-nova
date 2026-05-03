import { create } from 'zustand';

export type WorkspaceItem = {
  id: string;
  name: string;
  plan: 'starter' | 'pro' | 'enterprise';
  region: string;
};

type WorkspaceState = {
  currentWorkspaceId: string;
  items: WorkspaceItem[];
  setCurrentWorkspace: (id: string) => void;
  addWorkspace: (workspace: WorkspaceItem) => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspaceId: 'ws-core',
  items: [
    { id: 'ws-core', name: 'Core Product', plan: 'pro', region: 'India Central' },
    { id: 'ws-growth', name: 'Growth Lab', plan: 'starter', region: 'US East' },
    { id: 'ws-enterprise', name: 'Enterprise Ops', plan: 'enterprise', region: 'Europe West' },
  ],
  setCurrentWorkspace: (id: string) =>
    set((state) => {
      if (state.items.some((item) => item.id === id)) {
        return { currentWorkspaceId: id };
      }
      return state;
    }),
  addWorkspace: (workspace: WorkspaceItem) =>
    set((state) => ({
      items: [workspace, ...state.items],
      currentWorkspaceId: workspace.id,
    })),
}));
