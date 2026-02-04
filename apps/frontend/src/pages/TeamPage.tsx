import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { Link2, X, Search } from "lucide-react";
import { useTeams } from "../contexts/TeamContext";
import { teamApi, folderApi } from "../services/api";
import { useLinks } from "../hooks";
import type { Team, Folder as FolderType } from "../types";
import Layout from "../components/layout/Layout";
import CreateTeamModal from "../components/teams/CreateTeamModal";
import LinkGrid from "../components/dashboard/LinkGrid";

const TeamPage = () => {
  const { teamUuid } = useParams<{ teamUuid: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // useLinks 훅 사용
  const {
    links,
    filteredLinks,
    loading: linksLoading,
    selectedTags,
    searchQuery,
    deleteLink,
    setSearchQuery,
    handleTagClick,
    removeTag: handleRemoveTag,
    clearTags: handleClearTags,
  } = useLinks({
    teamUuid,
    folderUuid: selectedFolder?.folderUuid,
  });

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
    <Layout
      sidebarProps={{
        onCreateTeam: () => setIsModalOpen(true),
        selectedFolderUuid: selectedFolder?.folderUuid,
        onFolderSelect: handleFolderSelect,
      }}
    >
      {/* 제목 */}
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {currentTeam?.teamName} &gt; {selectedFolder?.folderName || "폴더 없음"}
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
              {searchQuery ? "검색 결과가 없습니다" : "아직 링크가 없습니다"}
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
          onDeleteLink={deleteLink}
          onTagClick={handleTagClick}
        />
      )}

      {/* 팀 만들기 모달 */}
      <CreateTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTeamCreated={(newTeam) => {
          addTeam(newTeam);
          setIsModalOpen(false);
        }}
      />
    </Layout>
  );
};

export default TeamPage;
