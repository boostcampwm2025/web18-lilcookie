import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useLinks } from "./useLinks";

vi.mock("../services/api", () => ({
  linkApi: {
    getLinks: vi.fn(),
    deleteLink: vi.fn(),
  },
}));

import { linkApi } from "../services/api";

const mockedGetLinks = linkApi.getLinks as ReturnType<typeof vi.fn>;
const mockedDeleteLink = linkApi.deleteLink as ReturnType<typeof vi.fn>;

const mockLinks = [
  {
    linkUuid: "link-1",
    title: "Link 1",
    summary: "",
    tags: [],
    url: "https://1.com",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    linkUuid: "link-2",
    title: "Link 2",
    summary: "",
    tags: ["foo"],
    url: "https://2.com",
    createdAt: "2026-01-02T00:00:00Z",
  },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 5 * 60 * 1000 },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetLinks.mockResolvedValue({ success: true, data: mockLinks });
  mockedDeleteLink.mockResolvedValue({ success: true });
});

describe("useLinks", () => {
  describe("fetch 동작 (useQuery)", () => {
    it("teamUuid + folderUuid가 모두 있으면 GET /links를 호출한다", async () => {
      const { result } = renderHook(
        () => useLinks({ teamUuid: "team-1", folderUuid: "folder-1" }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockedGetLinks).toHaveBeenCalledTimes(1);
      expect(mockedGetLinks).toHaveBeenCalledWith({
        teamUuid: "team-1",
        folderUuid: "folder-1",
      });
      expect(result.current.links).toEqual(mockLinks);
    });

    it("teamUuid가 없으면 fetch하지 않는다 (enabled: false)", async () => {
      const { result } = renderHook(
        () => useLinks({ teamUuid: undefined, folderUuid: "folder-1" }),
        { wrapper: createWrapper() },
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockedGetLinks).not.toHaveBeenCalled();
      expect(result.current.links).toEqual([]);
    });

    it("folderUuid가 없으면 fetch하지 않는다 (enabled: false)", async () => {
      const { result } = renderHook(
        () => useLinks({ teamUuid: "team-1", folderUuid: undefined }),
        { wrapper: createWrapper() },
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockedGetLinks).not.toHaveBeenCalled();
      expect(result.current.links).toEqual([]);
    });
  });

  describe("deleteLink (useMutation + setQueryData)", () => {
    it("deleteLink 호출 후 캐시에서 해당 링크가 즉시 제거된다", async () => {
      const { result } = renderHook(
        () => useLinks({ teamUuid: "team-1", folderUuid: "folder-1" }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.links.length).toBe(2);
      });

      await act(async () => {
        await result.current.deleteLink("link-1");
      });

      expect(mockedDeleteLink).toHaveBeenCalledWith("link-1");
      await waitFor(() => {
        expect(result.current.links).toEqual([
          expect.objectContaining({ linkUuid: "link-2" }),
        ]);
      });
    });

    it("deleteLink 후 추가 fetch가 발생하지 않는다 (refetch 없이 캐시 갱신)", async () => {
      const { result } = renderHook(
        () => useLinks({ teamUuid: "team-1", folderUuid: "folder-1" }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.links.length).toBe(2);
      });

      const fetchCountBefore = mockedGetLinks.mock.calls.length;

      await act(async () => {
        await result.current.deleteLink("link-1");
      });

      expect(mockedGetLinks.mock.calls.length).toBe(fetchCountBefore);
    });
  });

  describe("filteredLinks (검색·태그 필터)", () => {
    it("초기 searchQuery가 비어있으면 모든 링크를 반환한다", async () => {
      const { result } = renderHook(
        () => useLinks({ teamUuid: "team-1", folderUuid: "folder-1" }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.links.length).toBe(2);
      });

      expect(result.current.filteredLinks).toEqual(mockLinks);
    });

    it("searchQuery로 제목을 검색하면 일치하는 링크만 반환한다", async () => {
      const { result } = renderHook(
        () => useLinks({ teamUuid: "team-1", folderUuid: "folder-1" }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.links.length).toBe(2);
      });

      act(() => {
        result.current.setSearchQuery("Link 1");
      });

      await waitFor(() => {
        expect(result.current.filteredLinks).toEqual([
          expect.objectContaining({ linkUuid: "link-1" }),
        ]);
      });
    });

    it("handleTagClick으로 태그를 추가하면 selectedTags에 들어간다", async () => {
      const { result } = renderHook(
        () => useLinks({ teamUuid: "team-1", folderUuid: "folder-1" }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.links.length).toBe(2);
      });

      act(() => {
        result.current.handleTagClick("foo");
      });

      expect(result.current.selectedTags).toEqual(["foo"]);
    });

    it("같은 태그를 두 번 클릭해도 중복 추가되지 않는다", async () => {
      const { result } = renderHook(
        () => useLinks({ teamUuid: "team-1", folderUuid: "folder-1" }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.links.length).toBe(2);
      });

      act(() => {
        result.current.handleTagClick("foo");
        result.current.handleTagClick("foo");
      });

      expect(result.current.selectedTags).toEqual(["foo"]);
    });
  });
});
