import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
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
        teamId: 1,
        url: "https://react.dev",
        title: "React 공식 문서",
        tags: JSON.stringify(["리액트", "프론트엔드"]),
        summary: "React 최신 공식 문서입니다.",
        createdBy: 1,
        folderId: null,
      },
      {
        teamId: 1,
        url: "https://www.typescriptlang.org",
        title: "TypeScript 공식 문서",
        tags: JSON.stringify(["타입스크립트", "프론트엔드"]),
        summary: "TypeScript 공식 문서입니다.",
        createdBy: 1,
        folderId: null,
      },
      {
        teamId: 1,
        url: "https://nestjs.com",
        title: "NestJS 공식 문서",
        tags: JSON.stringify(["NestJS", "백엔드"]),
        summary: "NestJS 프레임워크 공식 문서입니다.",
        createdBy: 1,
        folderId: null,
      },
      {
        teamId: 1,
        url: "https://vitejs.dev",
        title: "Vite 공식 문서",
        tags: JSON.stringify(["Vite", "빌드도구"]),
        summary: "차세대 프론트엔드 빌드 도구 Vite 문서입니다.",
        createdBy: 1,
        folderId: null,
      },
      {
        teamId: 1,
        url: "https://tailwindcss.com",
        title: "Tailwind CSS 공식 문서",
        tags: JSON.stringify(["CSS", "프론트엔드", "디자인"]),
        summary: "유틸리티 우선 CSS 프레임워크 Tailwind CSS 문서입니다.",
        createdBy: 1,
        folderId: null,
      },
      {
        teamId: 1,
        url: "https://docs.github.com",
        title: "GitHub Docs",
        tags: JSON.stringify(["Git", "협업", "도구"]),
        summary: "GitHub 사용법 및 기능에 대한 공식 문서입니다.",
        createdBy: 1,
        folderId: null,
      },
      {
        teamId: 1,
        url: "https://developer.mozilla.org",
        title: "MDN Web Docs",
        tags: JSON.stringify(["JavaScript", "웹", "레퍼런스"]),
        summary: "웹 개발자를 위한 최고의 레퍼런스 문서입니다.",
        createdBy: 1,
        folderId: null,
      },
      {
        teamId: 1,
        url: "https://www.figma.com/best-practices",
        title: "Figma Best Practices",
        tags: JSON.stringify(["디자인", "UI/UX", "협업"]),
        summary: "Figma 디자인 협업 베스트 프랙티스 가이드입니다.",
        createdBy: 1,
        folderId: null,
      },
    ];

    for (const mock of mockLinks) {
      await this.linkRepository.create(mock);
    }
  }

  // 새로운 Link 생성
  async create(requestDto: CreateLinkRequestDto): Promise<Link> {
    const created = await this.linkRepository.create({
      teamId: requestDto.teamId,
      url: requestDto.url,
      title: requestDto.title,
      tags: JSON.stringify(requestDto.tags), // 배열 → JSON string
      summary: requestDto.summary,
      createdBy: requestDto.userId, // number
      folderId: requestDto.folderId || null,
    });

    // 임시로 슬랙 채널 ID는 하드코딩(C0A6S6AM1K7)
    this.notificationService.notifyLinkCreated(LinkNotificationDto.fromLink(created, "C0A6S6AM1K7")).catch(() => {});

    return created;
  }

  // 목록 조회 (전체 또는 조건)
  async findAll(teamId?: number, tagsQuery?: string, createdAfter?: string): Promise<Link[]> {
    const tags = tagsQuery ? tagsQuery.split(",").map((t) => t.trim()) : undefined;
    const afterDate = createdAfter ? new Date(createdAfter) : undefined;
    return this.linkRepository.findAll(teamId, tags, afterDate);
  }

  // 단건 조회
  async findOne(uuid: string): Promise<Link> {
    const link = await this.linkRepository.findOne(uuid);

    if (!link) {
      throw new NotFoundException(`링크를 찾을 수 없습니다: ${uuid}`);
    }

    return link;
  }

  // 단건 삭제
  async remove(uuid: string): Promise<void> {
    const removed = await this.linkRepository.remove(uuid);

    if (!removed) {
      throw new NotFoundException(`링크를 찾을 수 없습니다: ${uuid}`);
    }
  }
}
