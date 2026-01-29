import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Link2, X, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTeams } from "../contexts/TeamContext";
import { teamApi, folderApi, linkApi } from "../services/api";
import type { Team, Folder as FolderType, Link } from "../types";
import Sidebar from "../components/layout/Sidebar";
import CreateTeamModal from "../components/teams/CreateTeamModal";
import LinkGrid from "../components/dashboard/LinkGrid";

// TODO: 백엔드 연동 시 제거
const USE_MOCK_DATA = false;

// Mock 폴더 데이터 (팀별)
const mockFoldersMap: Record<string, FolderType[]> = {
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
};

// Mock 링크 데이터 (폴더별)
const mockLinksMap: Record<string, Link[]> = {
  "folder-uuid-1": [
    {
      linkUuid: "link-uuid-1",
      teamUuid: "team-uuid-1",
      folderUuid: "folder-uuid-1",
      url: "https://react.dev",
      title: "React 공식 문서",
      tags: ["리액트", "프론트엔드", "공식문서"],
      summary: "React 공식 문서입니다.",
      createdAt: "2024-06-15T10:20:30Z",
      createdBy: { userUuid: "user-1", userName: "J001" },
    },
    {
      linkUuid: "link-uuid-2",
      teamUuid: "team-uuid-1",
      folderUuid: "folder-uuid-1",
      url: "https://typescriptlang.org",
      title: "TypeScript 공식 문서",
      tags: ["타입스크립트", "프론트엔드"],
      summary: "TypeScript 공식 문서입니다.",
      createdAt: "2024-06-16T11:21:31Z",
      createdBy: { userUuid: "user-2", userName: "J002" },
    },
    {
      linkUuid: "link-uuid-3",
      teamUuid: "team-uuid-1",
      folderUuid: "folder-uuid-1",
      url: "https://nestjs.com",
      title: "NestJS 공식 문서",
      tags: ["NestJS", "백엔드", "프레임워크"],
      summary: "NestJS 공식 문서입니다.",
      createdAt: "2024-06-17T12:22:32Z",
      createdBy: { userUuid: "user-1", userName: "J001" },
    },
    {
      linkUuid: "link-uuid-6",
      teamUuid: "team-uuid-1",
      folderUuid: "folder-uuid-1",
      url: "https://nextjs.org",
      title: "Next.js 공식 문서",
      tags: ["Next.js", "SSR", "풀스택"],
      summary: "React 풀스택 프레임워크입니다.",
      createdAt: "2024-06-18T10:00:00Z",
      createdBy: { userUuid: "user-2", userName: "J002" },
    },
    {
      linkUuid: "link-uuid-7",
      teamUuid: "team-uuid-1",
      folderUuid: "folder-uuid-1",
      url: "https://vitejs.dev",
      title: "Vite 공식 문서",
      tags: ["Vite", "빌드도구"],
      summary: "차세대 빌드 도구입니다.",
      createdAt: "2024-06-19T11:00:00Z",
      createdBy: { userUuid: "user-1", userName: "J001" },
    },
    {
      linkUuid: "link-uuid-8",
      teamUuid: "team-uuid-1",
      folderUuid: "folder-uuid-1",
      url: "https://redux-toolkit.js.org",
      title: "Redux Toolkit",
      tags: ["Redux", "상태관리"],
      summary: "Redux 공식 권장 도구입니다.",
      createdAt: "2024-06-20T12:00:00Z",
      createdBy: { userUuid: "user-3", userName: "minsu" },
    },
    {
      linkUuid: "link-uuid-9",
      teamUuid: "team-uuid-1",
      folderUuid: "folder-uuid-1",
      url: "https://tanstack.com/query",
      title: "TanStack Query",
      tags: ["React Query", "데이터페칭"],
      summary: "서버 상태 관리 라이브러리입니다.",
      createdAt: "2024-06-21T13:00:00Z",
      createdBy: { userUuid: "user-2", userName: "J002" },
    },
    {
      linkUuid: "link-uuid-10",
      teamUuid: "team-uuid-1",
      folderUuid: "folder-uuid-1",
      url: "https://zod.dev",
      title: "Zod 공식 문서",
      tags: ["Zod", "유효성검사", "TypeScript"],
      summary: "스키마 검증 라이브러리입니다.",
      createdAt: "2024-06-22T14:00:00Z",
      createdBy: { userUuid: "user-1", userName: "J001" },
    },
    {
      linkUuid: "link-uuid-11",
      teamUuid: "team-uuid-1",
      folderUuid: "folder-uuid-1",
      url: "https://www.prisma.io",
      title: "Prisma ORM",
      tags: ["Prisma", "ORM", "DB"],
      summary: "Node.js ORM입니다.",
      createdAt: "2024-06-23T15:00:00Z",
      createdBy: { userUuid: "user-3", userName: "minsu" },
    },
    {
      linkUuid: "link-uuid-12",
      teamUuid: "team-uuid-1",
      folderUuid: "folder-uuid-1",
      url: "https://www.framer.com/motion",
      title: "Framer Motion",
      tags: ["애니메이션", "React"],
      summary: "React 애니메이션 라이브러리입니다.",
      createdAt: "2024-06-24T16:00:00Z",
      createdBy: { userUuid: "user-2", userName: "J002" },
    },
    {
      linkUuid: "link-uuid-13",
      teamUuid: "team-uuid-1",
      folderUuid: "folder-uuid-1",
      url: "https://developer.mozilla.org",
      title: "MDN Web Docs - 웹 개발 완벽 가이드",
      tags: ["MDN", "JavaScript", "HTML", "CSS", "웹표준", "프론트엔드"],
      summary: "웹 개발자를 위한 종합 문서입니다.",
      createdAt: "2024-06-25T17:00:00Z",
      createdBy: { userUuid: "user-1", userName: "J001" },
    },
  ],
  "folder-uuid-2": [
    {
      linkUuid: "link-uuid-4",
      teamUuid: "team-uuid-1",
      folderUuid: "folder-uuid-2",
      url: "https://tailwindcss.com",
      title: "Tailwind CSS 문서",
      tags: ["CSS", "프론트엔드", "스타일링"],
      summary: "유틸리티 우선 CSS 프레임워크입니다.",
      createdAt: "2024-06-18T13:23:33Z",
      createdBy: { userUuid: "user-2", userName: "junho" },
    },
  ],
  "folder-uuid-3": [
    {
      linkUuid: "link-uuid-5",
      teamUuid: "team-uuid-1",
      folderUuid: "folder-uuid-3",
      url: "https://docs.docker.com",
      title: "Docker 공식 문서",
      tags: ["Docker", "DevOps", "컨테이너"],
      summary: "Docker 컨테이너 기술을 배울 수 있는 공식 문서입니다.",
      createdAt: "2024-06-19T14:24:34Z",
      createdBy: { userUuid: "user-3", userName: "minsu" },
    },
  ],
  "default-folder": [],
};

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
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [linksLoading, setLinksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
          let folders: FolderType[] = [];

          if (USE_MOCK_DATA) {
            // Mock 데이터 사용 (어떤 팀이든 team-uuid-1의 mock 폴더 사용)
            folders = mockFoldersMap["team-uuid-1"] || [];
          } else {
            // 실제 API 호출
            const foldersResponse = await folderApi.getFolders(teamUuid);
            if (foldersResponse.success) {
              folders = foldersResponse.data;
            }
          }

          if (folders.length > 0) {
            // state로 전달받은 폴더가 있으면 해당 폴더 선택, 없으면 첫번째 폴더
            if (selectedFolderUuidFromState) {
              const folder = folders.find(
                (f) => f.folderUuid === selectedFolderUuidFromState,
              );
              setSelectedFolder(folder || folders[0]);
            } else {
              setSelectedFolder(folders[0]);
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

  // 폴더 선택 또는 태그 필터 변경 시 링크 로드
  useEffect(() => {
    const fetchLinks = async () => {
      if (!selectedFolder || !teamUuid) return;

      try {
        setLinksLoading(true);

        if (USE_MOCK_DATA) {
          // Mock 데이터 사용
          let mockLinks = mockLinksMap[selectedFolder.folderUuid] || [];

          // 태그 필터링
          if (selectedTags.length > 0) {
            mockLinks = mockLinks.filter((link) =>
              selectedTags.some((tag) => link.tags.includes(tag)),
            );
          }

          setLinks(mockLinks);
        } else {
          // 실제 API 호출
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
      if (!USE_MOCK_DATA) {
        await linkApi.deleteLink(linkUuid);
      }
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
    </div>
  );
};

export default TeamPage;
