import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  manualExpandedTeams: Record<string, boolean>;
  setTeamExpanded: (teamUuid: string, expanded: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      manualExpandedTeams: {},
      setTeamExpanded: (teamUuid, expanded) =>
        set((state) => ({
          manualExpandedTeams: {
            ...state.manualExpandedTeams,
            [teamUuid]: expanded,
          },
        })),
    }),
    { name: "sidebar-state" },
  ),
);
