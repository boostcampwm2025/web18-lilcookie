import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { LogOut, Link2, X, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTeams } from "../contexts/TeamContext";
import { teamApi, folderApi, linkApi } from "../services/api";
import type { Team, Folder as FolderType, Link } from "../types";
import Sidebar from "../components/layout/Sidebar";
import CreateTeamModal from "../components/teams/CreateTeamModal";
import CreateFolderModal from "../components/folders/CreateFolderModal";
import LinkGrid from "../components/dashboard/LinkGrid";

const TeamPage = () => {
  const { teamUuid } = useParams<{ teamUuid: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { addTeam } = useTeams();

  // navigate state로 전달받은 팀 정보 및 폴더 UUID
  const teamFromState = location.state?.team as Team | undefined;
  const selectedFolderUuidFromState = location.state?.selectedFolderUuid as
    | string
    | undefined;
  const selectedFolderUuidFromQuery =
    searchParams.get("folderUuid") || undefined;
  const selectedFolderUuidFromRequest =
    selectedFolderUuidFromState ?? selectedFolderUuidFromQuery;

  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [linksLoading, setLinksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderModalTeamUuid, setFolderModalTeamUuid] = useState<string | null>(
    null,
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Sidebar 폴더 캐시 갱신 트리거
  const [folderRefreshKey, setFolderRefreshKey] = useState(0);

  // 팀 및 폴더 정보 조회 (팀이 변경될 때만)
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

        // 폴더 조회
        if (teamUuid) {
          const foldersResponse = await folderApi.getFolders(teamUuid);
          const fetchedFolders = foldersResponse.success
            ? foldersResponse.data
            : [];

          if (fetchedFolders.length > 0) {
            // state로 전달받은 폴더가 있으면 해당 폴더 선택, 없으면 첫번째 폴더
            const targetFolder = selectedFolderUuidFromRequest
              ? fetchedFolders.find(
                  (f) => f.folderUuid === selectedFolderUuidFromRequest,
                )
              : null;
            setSelectedFolder(targetFolder || fetchedFolders[0]);
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
  }, [teamUuid, teamFromState, selectedFolderUuidFromRequest]);

  // 폴더 선택 핸들러 (Sidebar에서 호출)
  const handleFolderSelect = (folder: FolderType) => {
    if (folder.folderUuid !== selectedFolder?.folderUuid) {
      setSelectedFolder(folder);
    }
  };

  // 폴더 선택 또는 태그 필터 변경 시 링크 로드
  useEffect(() => {
    const fetchLinks = async () => {
      if (!selectedFolder || !teamUuid) return;

      try {
        setLinksLoading(true);
        const response = await linkApi.getLinks({
          teamUuid,
          folderUuid: selectedFolder.folderUuid,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
        });
        if (response.success) {
          setLinks(response.data);
        } else {
          console.error("링크 조회 실패:", response.message);
          setLinks([]);
        }
      } catch (error) {
        console.error("링크 조회 중 오류:", error);
        setLinks([]);
      } finally {
        setLinksLoading(false);
      }
    };

    fetchLinks();
  }, [selectedFolder, teamUuid, selectedTags]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleDeleteLink = async (linkUuid: string) => {
    try {
      await linkApi.deleteLink(linkUuid);
      setLinks((prev) => prev.filter((link) => link.linkUuid !== linkUuid));
    } catch (error) {
      console.error("링크 삭제 실패:", error);
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleClearTags = () => {
    setSelectedTags([]);
  };

  // 폴더 생성 모달 열기
  const handleCreateFolder = (targetTeamUuid: string) => {
    setFolderModalTeamUuid(targetTeamUuid);
    setIsFolderModalOpen(true);
  };

  // 폴더 삭제
  const handleDeleteFolder = async (
    targetTeamUuid: string,
    folderUuid: string,
    folderName: string,
  ) => {
    const confirmed = window.confirm(
      `"${folderName}" 폴더를 삭제하시겠습니까?\n폴더 내 모든 링크도 함께 삭제됩니다.`,
    );

    if (!confirmed) return;

    try {
      await folderApi.deleteFolder(folderUuid);

      // 삭제된 폴더가 현재 선택된 폴더면 기본 폴더로 이동
      if (selectedFolder?.folderUuid === folderUuid) {
        const foldersResponse = await folderApi.getFolders(targetTeamUuid);
        if (foldersResponse.success && foldersResponse.data.length > 0) {
          const firstFolder = foldersResponse.data[0];
          setSelectedFolder(firstFolder);
        }
      }

      // Sidebar 폴더 캐시 갱신 트리거
      setFolderRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("폴더 삭제 실패:", error);
      alert("폴더 삭제에 실패했습니다.");
    }
  };

  // 검색 필터링
  const filteredLinks = links.filter((link) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      link.title.toLowerCase().includes(query) ||
      link.summary.toLowerCase().includes(query) ||
      link.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

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
      <Sidebar
        onCreateTeam={() => setIsModalOpen(true)}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={handleDeleteFolder}
        selectedFolderUuid={selectedFolder?.folderUuid}
        onFolderSelect={handleFolderSelect}
        folderRefreshKey={folderRefreshKey}
      />

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
          <p className="text-sm text-gray-500 mb-4">
            {filteredLinks.length}개의 링크
            {searchQuery && ` (전체 ${links.length}개 중)`}
          </p>

          {/* 검색 바 */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="제목, 요약, 태그로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 선택된 태그 필터 */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-gray-500">필터:</span>
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={handleClearTags}
                className="text-sm text-gray-500 hover:text-gray-700 underline cursor-pointer"
              >
                모두 지우기
              </button>
            </div>
          )}

          {/* 링크 카드 영역 */}
          {filteredLinks.length === 0 && !linksLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  {searchQuery ? (
                    <Search className="w-8 h-8 text-gray-400" />
                  ) : (
                    <Link2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery
                    ? "검색 결과가 없습니다"
                    : "아직 링크가 없습니다"}
                </h2>
                <p className="text-sm text-gray-500">
                  {searchQuery
                    ? "다른 검색어로 시도해보세요"
                    : "익스텐션을 통해 링크를 추가해보세요"}
                </p>
              </div>
            </div>
          ) : (
            <LinkGrid
              links={filteredLinks}
              loading={linksLoading}
              onDeleteLink={handleDeleteLink}
              onTagClick={handleTagClick}
            />
          )}
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

      {/* 폴더 만들기 모달 */}
      <CreateFolderModal
        isOpen={isFolderModalOpen}
        teamUuid={folderModalTeamUuid}
        onClose={() => {
          setIsFolderModalOpen(false);
          setFolderModalTeamUuid(null);
        }}
        onFolderCreated={() => {
          setIsFolderModalOpen(false);
          setFolderModalTeamUuid(null);
          // Sidebar 폴더 캐시 갱신 트리거
          setFolderRefreshKey((prev) => prev + 1);
        }}
      />
    </div>
  );
};

export default TeamPage;
