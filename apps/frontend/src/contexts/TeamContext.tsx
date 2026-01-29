/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { teamApi } from "../services/api";
import type { Team } from "../types";
import { useAuth } from "./AuthContext";

interface TeamsContextType {
  teams: Team[];
  loading: boolean;
  refreshTeams: () => Promise<void>;
  addTeam: (team: Team) => void;
}

const TeamsContext = createContext<TeamsContextType | null>(null);

export const TeamsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTeams = useCallback(async () => {
    if (!isAuthenticated) {
      setTeams([]);
      setLoading(false);
      return;
    }

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
  }, [isAuthenticated]);

  const addTeam = useCallback((team: Team) => {
    setTeams((prev) => [...prev, team]);
  }, []);

  // 인증 상태가 확정되고 로그인된 경우에만 팀 목록 조회
  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      refreshTeams();
    } else {
      setTeams([]);
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, refreshTeams]);

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
