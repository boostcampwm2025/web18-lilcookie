import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  Users,
  ChevronDown,
  ChevronRight,
  Folder,
  Link2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { teamApi, folderApi } from "../services/api";
import type { Team, Folder as FolderType } from "../types";

// TODO: 백엔드 연동 시 제거
const USE_MOCK_DATA = true;

// Mock 폴더 데이터 (팀별)
const mockFoldersMap: Record<string, import("../types").Folder[]> = {
  "team-uuid-1": [
    {
      folderUuid: "folder-uuid-1",
      folderName: "기본 폴더",
      createdAt: "2024-06-15T10:20:30Z",
      createdBy: { userUuid: "user-1", userName: "admin" },
    },
    {
      folderUuid: "folder-uuid-2",
      folderName: "프론트엔드 자료",
      createdAt: "2024-06-16T11:21:31Z",
      createdBy: { userUuid: "user-1", userName: "admin" },
    },
    {
      folderUuid: "folder-uuid-3",
      folderName: "백엔드 자료",
      createdAt: "2024-06-17T12:22:32Z",
      createdBy: { userUuid: "user-2", userName: "junho" },
    },
  ],
  "team-uuid-2": [
    {
      folderUuid: "folder-uuid-4",
      folderName: "기본 폴더",
      createdAt: "2024-06-16T11:21:31Z",
      createdBy: { userUuid: "user-1", userName: "admin" },
    },
    {
      folderUuid: "folder-uuid-5",
      folderName: "UI/UX 레퍼런스",
      createdAt: "2024-06-17T12:22:32Z",
      createdBy: { userUuid: "user-3", userName: "minsu" },
    },
  ],
};

const TeamPage = () => {
  const { teamUuid } = useParams<{ teamUuid: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // navigate state로 전달받은 팀 정보
  const teamFromState = location.state?.team as Team | undefined;

  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTeamExpanded, setIsTeamExpanded] = useState(true);

  // 팀 및 폴더 정보 조회
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (USE_MOCK_DATA) {
          // state로 전달받은 팀 정보 사용, 없으면 URL 기반으로 생성
          const team: Team = teamFromState || {
            teamUuid: teamUuid || "",
            teamName: "새 팀",
            createdAt: new Date().toISOString(),
            role: "admin",
          };
          setCurrentTeam(team);

          // 팀별 mock 폴더 데이터 사용, 없으면 기본 폴더 생성
          const mockFolders = mockFoldersMap[teamUuid || ""];
          if (mockFolders && mockFolders.length > 0) {
            setFolders(mockFolders);
            setSelectedFolder(mockFolders[0]);
          } else {
            // 새로 생성한 팀은 기본 폴더만
            const defaultFolder: FolderType = {
              folderUuid: "default-folder",
              folderName: "기본 폴더",
              createdAt: new Date().toISOString(),
              createdBy: {
                userUuid: "user-1",
                userName: user?.nickname || "사용자",
              },
            };
            setFolders([defaultFolder]);
            setSelectedFolder(defaultFolder);
          }
        } else {
          // 실제 API 호출
          if (teamFromState) {
            setCurrentTeam(teamFromState);
          } else {
            const teamsResponse = await teamApi.getMyTeams();
            if (teamsResponse.success) {
              const team = teamsResponse.data.find(
                (t) => t.teamUuid === teamUuid,
              );
              if (team) {
                setCurrentTeam(team);
              } else {
                setError("팀을 찾을 수 없습니다.");
                return;
              }
            } else {
              setError(
                teamsResponse.message || "팀 정보를 불러오는데 실패했습니다.",
              );
              return;
            }
          }

          // 폴더 조회
          if (teamUuid) {
            const foldersResponse = await folderApi.getFolders(teamUuid);
            if (foldersResponse.success) {
              setFolders(foldersResponse.data);
              if (foldersResponse.data.length > 0) {
                setSelectedFolder(foldersResponse.data[0]);
              }
            } else {
              setError(
                foldersResponse.message ||
                  "폴더 목록을 불러오는데 실패했습니다.",
              );
            }
          }
        }
      } catch (error) {
        console.error("데이터 조회 실패:", error);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamUuid, teamFromState, user?.nickname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleFolderClick = (folder: FolderType) => {
    setSelectedFolder(folder);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate("/my-teams")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            내 팀으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* 로고 */}
        <div className="h-14 px-4 border-b border-gray-200 flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <span className="font-bold text-lg text-gray-900">TeamStash</span>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {/* 내 팀 섹션 */}
          <div className="mb-2">
            <button
              onClick={() => navigate("/my-teams")}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">내 팀</span>
            </button>
          </div>

          {/* 현재 팀 */}
          {currentTeam && (
            <div className="ml-2">
              {/* 팀 헤더 */}
              <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-600">
                <button
                  onClick={() => setIsTeamExpanded(!isTeamExpanded)}
                  className="p-0.5 hover:bg-blue-100 rounded cursor-pointer"
                >
                  {isTeamExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium flex-1">
                  {currentTeam.teamName}
                </span>
              </div>

              {/* 폴더 목록 */}
              {isTeamExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {folders.map((folder) => (
                    <button
                      key={folder.folderUuid}
                      onClick={() => handleFolderClick(folder)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-sm transition-colors cursor-pointer ${
                        selectedFolder?.folderUuid === folder.folderUuid
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Folder className="w-4 h-4" />
                      <span>{folder.folderName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* 하단 버튼 */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => navigate("/my-teams")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium text-sm"
          >
            <span>+ 팀 만들기</span>
          </button>
        </div>
      </aside>

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-end">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              {user?.nickname || user?.email?.split("@")[0]}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">로그아웃</span>
            </button>
          </div>
        </header>

        {/* 컨텐츠 */}
        <main className="flex-1 p-8 overflow-auto">
          {/* 제목 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {currentTeam?.teamName} &gt;{" "}
            {selectedFolder?.folderName || "폴더 없음"}
          </h1>
          <p className="text-sm text-gray-500 mb-8">0개의 링크</p>

          {/* 링크 카드 영역 (현재는 빈 상태) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 링크가 없을 때 */}
            <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Link2 className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  아직 링크가 없습니다
                </h2>
                <p className="text-sm text-gray-500">
                  익스텐션을 통해 링크를 추가해보세요
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeamPage;
