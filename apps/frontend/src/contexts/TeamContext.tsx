/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { teamApi } from "../services/api";
import type { Team } from "../types";

interface TeamsContextType {
  teams: Team[];
  loading: boolean;
  refreshTeams: () => Promise<void>;
  addTeam: (team: Team) => void;
}

const TeamsContext = createContext<TeamsContextType | null>(null);

export const TeamsProvider = ({ children }: { children: ReactNode }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTeams = async () => {
    try {
      setLoading(true);
      const response = await teamApi.getMyTeams();
      if (response.success) {
        setTeams(response.data);
      }
    } catch (error) {
      console.error("팀 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTeam = (team: Team) => {
    setTeams((prev) => [...prev, team]);
  };

  useEffect(() => {
    refreshTeams();
  }, []);

  return (
    <TeamsContext.Provider value={{ teams, loading, refreshTeams, addTeam }}>
      {children}
    </TeamsContext.Provider>
  );
};

export const useTeams = () => {
  const context = useContext(TeamsContext);
  if (!context) {
    throw new Error("useTeams must be used within TeamsProvider");
  }
  return context;
};
