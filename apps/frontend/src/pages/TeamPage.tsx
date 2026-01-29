import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Link2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTeams } from "../contexts/TeamContext";
import { teamApi, folderApi } from "../services/api";
import type { Team, Folder as FolderType } from "../types";
import Sidebar from "../components/layout/Sidebar";
import CreateTeamModal from "../components/teams/CreateTeamModal";

const TeamPage = () => {
  const { teamUuid } = useParams<{ teamUuid: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { addTeam } = useTeams();

  // navigate state로 전달받은 정보
  const teamFromState = location.state?.team as Team | undefined;
  const selectedFolderUuidFromState = location.state?.selectedFolderUuid as
    | string
    | undefined;

  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 팀 및 폴더 정보 조회
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 팀 정보 설정
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

        // 폴더 조회 및 선택된 폴더 설정
        if (teamUuid) {
          const foldersResponse = await folderApi.getFolders(teamUuid);
          if (foldersResponse.success && foldersResponse.data.length > 0) {
            // state로 전달받은 폴더가 있으면 해당 폴더 선택, 없으면 첫번째 폴더
            if (selectedFolderUuidFromState) {
              const folder = foldersResponse.data.find(
                (f) => f.folderUuid === selectedFolderUuidFromState,
              );
              setSelectedFolder(folder || foldersResponse.data[0]);
            } else {
              setSelectedFolder(foldersResponse.data[0]);
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
  }, [teamUuid, teamFromState, selectedFolderUuidFromState]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
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
      <Sidebar onCreateTeam={() => setIsModalOpen(true)} />

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

      {/* 팀 만들기 모달 */}
      <CreateTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTeamCreated={(newTeam) => {
          addTeam(newTeam);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default TeamPage;
