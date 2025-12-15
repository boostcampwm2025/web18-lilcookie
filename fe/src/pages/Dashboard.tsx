import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import LinkGrid from "../components/dashboard/LinkGrid";
import type { Link } from "../types";
import { linkApi } from "../services/api";
import { ExternalLink } from "lucide-react";

const Dashboard = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  const [links, setLinks] = useState<Link[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const getTeamName = (id: string) => {
    // web01~30, ios01~04 표시
    if (id.startsWith("web") || id.startsWith("ios")) {
      return `${id} 팀`;
    }
    return id;
  };

  // teamId 목록 생성
  const getValidTeamIds = (): string[] => {
    const teams: string[] = [];

    // web01 ~ web30
    for (let i = 1; i <= 30; i++) {
      teams.push(`web${String(i).padStart(2, "0")}`);
    }

    // ios01 ~ ios04
    for (let i = 1; i <= 4; i++) {
      teams.push(`ios${String(i).padStart(2, "0")}`);
    }

    return teams;
  };

  useEffect(() => {
    if (teamId) {
      fetchLinks(teamId);
    }
  }, [teamId]);

  // 검색 및 태그 필터링
  useEffect(() => {
    let result = [...links];

    // 태그 필터링
    if (selectedTags.length > 0) {
      result = result.filter((link) =>
        selectedTags.every((tag) => link.tags.includes(tag))
      );
    }

    // 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (link) =>
          link.title.toLowerCase().includes(query) ||
          link.summary.toLowerCase().includes(query) ||
          link.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          link.url.toLowerCase().includes(query)
      );
    }

    setFilteredLinks(result);
  }, [links, selectedTags, searchQuery]);

  const fetchLinks = async (team: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await linkApi.getLinks(team);

      if (response.success) {
        setLinks(response.data);
      } else {
        setError("링크를 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error("API Error:", err);

      // 백엔드 없을 때 데이터
      setLinks(getMockLinks(team));
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // mock 데이터
  const getMockLinks = (team: string): Link[] => {
    const allLinks: Record<string, Link[]> = {
      web01: [
        {
          linkId: "uuid-1",
          teamId: "web01",
          url: "https://react.dev",
          title: "React Best Practices - 2025 Complete Guide",
          summary:
            "Learn the latest React patterns and best practices for building modern web applications.",
          tags: ["react", "best-practices", "guide"],
          createdAt: "2025. 12. 16. 오전 4:30:00",
          createdBy: "J001",
        },
        {
          linkId: "uuid-2",
          teamId: "web01",
          url: "https://tailwindcss.com",
          title: "Tailwind CSS v4.0 Documentation",
          summary:
            "Rapidly build modern websites without ever leaving your HTML.",
          tags: ["css", "tailwind", "design-system"],
          createdAt: "2025. 12. 15. 오후 2:15:00",
          createdBy: "K001",
        },
        {
          linkId: "uuid-3",
          teamId: "web01",
          url: "https://nodejs.org",
          title: "Node.js Performance Optimization Techniques",
          summary: "Advanced techniques for optimizing Node.js applications.",
          tags: ["nodejs", "performance", "backend"],
          createdAt: "2025. 12. 14. 오전 10:00:00",
          createdBy: "S001",
        },
      ],
      web02: [
        {
          linkId: "uuid-4",
          teamId: "web02",
          url: "https://www.figma.com",
          title: "Figma Design System Best Practices",
          summary:
            "How to build and maintain a scalable design system in Figma.",
          tags: ["figma", "design-system", "ui"],
          createdAt: "2025. 12. 13. 오후 3:00:00",
          createdBy: "J001",
        },
        {
          linkId: "uuid-5",
          teamId: "web02",
          url: "https://vercel.com",
          title: "Growth Hacking Strategies for 2025",
          summary: "Proven growth strategies and tactics for startups.",
          tags: ["marketing", "growth", "strategy"],
          createdAt: "2025. 12. 12. 오전 11:30:00",
          createdBy: "K001",
        },
      ],
      ios01: [
        {
          linkId: "uuid-6",
          teamId: "ios01",
          url: "https://developer.apple.com/swift",
          title: "Swift 6.0 - What's New",
          summary: "Latest features and improvements in Swift 6.0.",
          tags: ["swift", "ios", "mobile"],
          createdAt: "2025. 12. 16. 오전 9:00:00",
          createdBy: "S001",
        },
      ],
      ios02: [
        {
          linkId: "uuid-7",
          teamId: "ios02",
          url: "https://developer.apple.com/swiftui",
          title: "SwiftUI Layout Best Practices",
          summary: "Complete guide to building layouts with SwiftUI.",
          tags: ["swiftui", "ios", "layout"],
          createdAt: "2025. 12. 11. 오후 4:20:00",
          createdBy: "J001",
        },
      ],
    };

    return allLinks[team] || [];
  };

  // 링크 삭제 (204 No Content 처리)
  const handleDeleteLink = async (linkId: string) => {
    if (!confirm("정말로 이 링크를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await linkApi.deleteLink(linkId);
      setLinks(links.filter((link) => link.linkId !== linkId));
    } catch (err) {
      console.error("링크 삭제 실패:", err);
      alert("링크 삭제에 실패했습니다.");
    }
  };

  // 태그 클릭 핸들러
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 태그 필터 초기화
  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  if (error && links.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentTeam={teamId || ""} />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {error}
            </h3>
            <button
              onClick={() => fetchLinks(teamId || "web01")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentTeam={teamId || ""}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getTeamName(teamId || "")}
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              {filteredLinks.length}개의 링크
              {selectedTags.length > 0 && ` (전체 ${links.length}개)`}
            </p>
          </div>

          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl">
            <ExternalLink className="w-5 h-5" />
            <span className="font-semibold">모두 열기</span>
          </button>
        </div>

        {/* 선택된 태그 필터 표시 */}
        {selectedTags.length > 0 && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">
              필터링된 태그:
            </span>
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                # {tag}
                <button
                  onClick={() => handleTagClick(tag)}
                  className="hover:text-blue-900"
                >
                  X
                </button>
              </span>
            ))}
            <button
              onClick={clearTagFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              모두 지우기
            </button>
          </div>
        )}

        {/* 팀 전환 버튼 (프로토타이핑용) */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {getValidTeamIds().map((id) => (
              <button
                key={id}
                onClick={() => navigate(`/${id}`)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  teamId === id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        <LinkGrid
          links={filteredLinks}
          loading={loading}
          onDeleteLink={handleDeleteLink}
          onTagClick={handleTagClick}
        />
      </main>
    </div>
  );
};

export default Dashboard;
