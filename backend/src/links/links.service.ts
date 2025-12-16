import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Link } from "./entities/link.entity";
import { CreateLinkRequestDto } from "./dto/create-link.request.dto";

@Injectable()
export class LinksService {
  // MVP 인메모리 저장소 (Map 사용)
  private readonly links: Map<string, Link> = new Map();

  constructor() {
    // 초기 mock data 추가
    this.initMockData();
  }

  // 초기 mock data 생성
  private initMockData(): void {
    const mockLinks = [
      {
        teamId: "web01",
        url: "https://react.dev",
        title: "React 공식 문서",
        tags: ["리액트", "프론트엔드"],
        summary: "React 최신 공식 문서입니다.",
        userId: "J001",
        createdAt: "2025-12-16T03:00:00.000Z",
      },
      {
        teamId: "web01",
        url: "https://www.typescriptlang.org",
        title: "TypeScript 공식 문서",
        tags: ["타입스크립트", "프론트엔드"],
        summary: "TypeScript 공식 문서입니다.",
        userId: "J002",
        createdAt: "2025-12-15T05:30:00.000Z",
      },
      {
        teamId: "web01",
        url: "https://nestjs.com",
        title: "NestJS 공식 문서",
        tags: ["NestJS", "백엔드"],
        summary: "NestJS 프레임워크 공식 문서입니다.",
        userId: "J001",
        createdAt: "2025-12-14T08:00:00.000Z",
      },
      {
        teamId: "web01",
        url: "https://vitejs.dev",
        title: "Vite 공식 문서",
        tags: ["Vite", "빌드도구"],
        summary: "차세대 프론트엔드 빌드 도구 Vite 문서입니다.",
        userId: "J003",
        createdAt: "2025-12-11T10:00:00.000Z",
      },
      {
        teamId: "web01",
        url: "https://tailwindcss.com",
        title: "Tailwind CSS 공식 문서",
        tags: ["CSS", "프론트엔드", "디자인"],
        summary: "유틸리티 우선 CSS 프레임워크 Tailwind CSS 문서입니다.",
        userId: "J002",
        createdAt: "2025-12-06T02:00:00.000Z",
      },
      {
        teamId: "web01",
        url: "https://docs.github.com",
        title: "GitHub Docs",
        tags: ["Git", "협업", "도구"],
        summary: "GitHub 사용법 및 기능에 대한 공식 문서입니다.",
        userId: "J001",
        createdAt: "2025-12-01T06:00:00.000Z",
      },
      {
        teamId: "web01",
        url: "https://developer.mozilla.org",
        title: "MDN Web Docs",
        tags: ["JavaScript", "웹", "레퍼런스"],
        summary: "웹 개발자를 위한 최고의 레퍼런스 문서입니다.",
        userId: "J003",
        createdAt: "2025-11-16T04:00:00.000Z",
      },
      {
        teamId: "web01",
        url: "https://www.figma.com/best-practices",
        title: "Figma Best Practices",
        tags: ["디자인", "UI/UX", "협업"],
        summary: "Figma 디자인 협업 베스트 프랙티스 가이드입니다.",
        userId: "J002",
        createdAt: "2025-10-17T07:00:00.000Z",
      },
    ];

    mockLinks.forEach((mockLink) => {
      const linkId = randomUUID();

      const link = new Link({
        linkId,
        teamId: mockLink.teamId,
        url: mockLink.url,
        title: mockLink.title,
        tags: mockLink.tags,
        summary: mockLink.summary,
        createdAt: mockLink.createdAt,
        createdBy: mockLink.userId,
      });

      this.links.set(linkId, link);
    });
  }

  // 새로운 Link 생성
  create(requestDto: CreateLinkRequestDto): Link {
    const linkId = randomUUID();
    const createdAt = new Date().toISOString();

    const link = new Link({
      linkId,
      teamId: requestDto.teamId,
      url: requestDto.url,
      title: requestDto.title,
      tags: requestDto.tags,
      summary: requestDto.summary,
      createdAt,
      createdBy: requestDto.userId,
    });

    this.links.set(linkId, link);
    return link;
  }

  // 목록 조회 (전체 또는 조건)
  findAll(teamId?: string, tagsQuery?: string): Link[] {
    let links = Array.from(this.links.values());

    // teamId 필터링 (lowercase 비교)
    if (teamId) {
      links = links.filter((link) => link.teamId === teamId.toLowerCase());
    }

    // tags 필터링 (쉼표로 구분된 태그들이 전부 매칭되어야 함)
    if (tagsQuery) {
      const queryTags = tagsQuery.split(",").map((tag) => tag.trim());
      links = links.filter((link) => queryTags.every((queryTag) => link.tags.includes(queryTag)));
    }

    return links;
  }

  // 단건 조회
  findOne(linkId: string): Link {
    const link = this.links.get(linkId);
    if (!link) {
      throw new NotFoundException(`링크를 찾을 수 없습니다: ${linkId}`);
    }
    return link;
  }

  // 단건 삭제
  remove(linkId: string): void {
    const exists = this.links.has(linkId);
    if (!exists) {
      throw new NotFoundException(`링크를 찾을 수 없습니다: ${linkId}`);
    }
    this.links.delete(linkId);
  }
}
