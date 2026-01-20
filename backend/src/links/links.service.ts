import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Link } from "./entities/link.entity";
import { CreateLinkRequestDto } from "./dto/create-link.request.dto";
import { ConfigService } from "@nestjs/config";
import { NotificationService } from "../notification/notification.service";
import { LinkNotificationDto } from "../notification/dto/link-notification.dto";
import { LinkRepository } from "./repositories/link.repository";

@Injectable()
export class LinksService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly linkRepository: LinkRepository,
    private readonly notificationService: NotificationService,
  ) {}

  onModuleInit() {
    this.initMockData().catch(() => {});
  }

  // 초기 mock data 생성
  private async initMockData(): Promise<void> {
    if (this.configService.get<string>("NODE_ENV") === "production") {
      return;
    }

    // 이미 데이터가 있으면 추가하지 않음
    const existingLinks = await this.linkRepository.findAll();
    if (existingLinks.length > 0) {
      return;
    }

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

    for (const mockLink of mockLinks) {
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

      await this.linkRepository.create(link);
    }
  }

  // 새로운 Link 생성
  async create(requestDto: CreateLinkRequestDto): Promise<Link> {
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
      folderId: requestDto.folderId || null,
    });

    const created = await this.linkRepository.create(link);

    // 임시로 슬랙 채널 ID는 하드코딩(C0A6S6AM1K7)
    this.notificationService.notifyLinkCreated(LinkNotificationDto.fromLink(created, "C0A6S6AM1K7")).catch(() => {});

    return created;
  }

  // 목록 조회 (전체 또는 조건)
  async findAll(teamId?: string, tagsQuery?: string, createdAfter?: string): Promise<Link[]> {
    const tags = tagsQuery ? tagsQuery.split(",").map((tag) => tag.trim()) : undefined;
    const afterDate = createdAfter ? new Date(createdAfter) : undefined;

    return this.linkRepository.findAll(teamId, tags, afterDate);
  }

  // 단건 조회
  async findOne(linkId: string): Promise<Link> {
    const link = await this.linkRepository.findOne(linkId);

    if (!link) {
      throw new NotFoundException(`링크를 찾을 수 없습니다: ${linkId}`);
    }

    return link;
  }

  // 단건 삭제
  async remove(linkId: string): Promise<void> {
    const removed = await this.linkRepository.remove(linkId);

    if (!removed) {
      throw new NotFoundException(`링크를 찾을 수 없습니다: ${linkId}`);
    }
  }
}
