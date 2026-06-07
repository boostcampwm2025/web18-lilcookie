import { describe, it, expect, beforeEach } from "vitest";
import { useSidebarStore } from "./sidebar.store";

describe("useSidebarStore", () => {
  beforeEach(() => {
    // 각 테스트 전 store + localStorage 초기화
    useSidebarStore.setState({ manualExpandedTeams: {} });
    localStorage.clear();
  });

  describe("초기 상태", () => {
    it("manualExpandedTeams는 빈 객체로 시작한다", () => {
      expect(useSidebarStore.getState().manualExpandedTeams).toEqual({});
    });

    it("setTeamExpanded 액션이 정의되어 있다", () => {
      expect(typeof useSidebarStore.getState().setTeamExpanded).toBe("function");
    });
  });

  describe("setTeamExpanded", () => {
    it("팀을 펼침 상태(true)로 설정한다", () => {
      useSidebarStore.getState().setTeamExpanded("team-1", true);
      expect(useSidebarStore.getState().manualExpandedTeams).toEqual({
        "team-1": true,
      });
    });

    it("팀을 접힘 상태(false)로 설정한다", () => {
      useSidebarStore.getState().setTeamExpanded("team-1", true);
      useSidebarStore.getState().setTeamExpanded("team-1", false);
      expect(useSidebarStore.getState().manualExpandedTeams).toEqual({
        "team-1": false,
      });
    });

    it("여러 팀의 상태를 독립적으로 관리한다", () => {
      const { setTeamExpanded } = useSidebarStore.getState();
      setTeamExpanded("team-1", true);
      setTeamExpanded("team-2", false);
      setTeamExpanded("team-3", true);

      expect(useSidebarStore.getState().manualExpandedTeams).toEqual({
        "team-1": true,
        "team-2": false,
        "team-3": true,
      });
    });

    it("한 팀 상태를 변경해도 다른 팀 상태는 유지된다", () => {
      const { setTeamExpanded } = useSidebarStore.getState();
      setTeamExpanded("team-1", true);
      setTeamExpanded("team-2", true);
      setTeamExpanded("team-1", false);

      expect(useSidebarStore.getState().manualExpandedTeams).toEqual({
        "team-1": false,
        "team-2": true,
      });
    });
  });

  describe("persist middleware (localStorage 영속화)", () => {
    it("setTeamExpanded 호출 시 localStorage 'sidebar-state' 키에 저장된다", () => {
      useSidebarStore.getState().setTeamExpanded("team-1", true);

      const stored = localStorage.getItem("sidebar-state");
      expect(stored).not.toBeNull();
    });

    it("저장된 값은 manualExpandedTeams를 포함한다", () => {
      useSidebarStore.getState().setTeamExpanded("team-1", true);
      useSidebarStore.getState().setTeamExpanded("team-2", false);

      const stored = JSON.parse(localStorage.getItem("sidebar-state")!);
      expect(stored.state.manualExpandedTeams).toEqual({
        "team-1": true,
        "team-2": false,
      });
    });
  });
});
