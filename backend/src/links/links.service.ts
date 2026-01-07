import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Link } from "./entities/link.entity";
import { CreateLinkRequestDto } from "./dto/create-link.request.dto";
import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "../database/database.service";

// MVP라서 일단 서비스 상단에 인터페이스 정의했음
interface LinkRow {
  link_id: string;
  team_id: string;
  url: string;
  title: string;
  tags: string;
  summary: string;
  created_at: string;
  created_by: string;
  folder_id: string | null;
}

@Injectable()
export class LinksService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {}

  onModuleInit() {
    this.initMockData();
  }

  // 초기 mock data 생성
  private initMockData(): void {
    if (this.configService.get<string>("NODE_ENV") === "production") {
      return;
    }

    const db = this.databaseService.getDatabase();

    // 이미 데이터가 있으면 추가하지 않음
    const count = db.prepare("SELECT COUNT(*) as count FROM links").get() as { count: number };
    if (count.count > 0) {
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

      const insertStmt = db.prepare(`
        INSERT INTO links (link_id, team_id, url, title, tags, summary, created_at, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertStmt.run(
        link.linkId,
        link.teamId,
        link.url,
        link.title,
        JSON.stringify(link.tags),
        link.summary,
        link.createdAt,
        link.createdBy,
      );
    });
  }

  // 새로운 Link 생성
  create(requestDto: CreateLinkRequestDto): Link {
    const db = this.databaseService.getDatabase();
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

    const insertStmt = db.prepare(`
      INSERT INTO links (link_id, team_id, url, title, tags, summary, created_at, created_by, folder_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      link.linkId,
      link.teamId,
      link.url,
      link.title,
      JSON.stringify(link.tags),
      link.summary,
      link.createdAt,
      link.createdBy,
      link.folderId,
    );

    return link;
  }

  // 목록 조회 (전체 또는 조건)
  findAll(teamId?: string, tagsQuery?: string, createdAfter?: string): Link[] {
    const db = this.databaseService.getDatabase();
    // 동적 쿼리 (AND) 위해 WHERE 절 구성
    let query = "SELECT * FROM links WHERE 1=1";
    const params: string[] = [];

    // teamId 필터링 (lowercase 비교)
    if (teamId) {
      query += " AND team_id = ?";
      params.push(teamId.toLowerCase());
    }

    // tags 필터링 (쉼표로 구분된 태그들이 전부 매칭되어야 함)
    if (tagsQuery) {
      const queryTags = tagsQuery.split(",").map((tag) => tag.trim());
      queryTags.forEach((tag) => {
        query += " AND tags LIKE ?";
        params.push(`%"${tag}"%`); // JSON 배열 내 검색
      });
    }

    // createdAfter 필터링
    if (createdAfter) {
      const afterDate = new Date(createdAfter);
      if (!isNaN(afterDate.getTime())) {
        query += " AND created_at > ?";
        params.push(afterDate.toISOString());
      }
    }

    query += " ORDER BY created_at DESC";

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as LinkRow[];

    return rows.map(
      (row) =>
        new Link({
          linkId: row.link_id,
          teamId: row.team_id,
          url: row.url,
          title: row.title,
          tags: JSON.parse(row.tags) as string[],
          summary: row.summary,
          createdAt: row.created_at,
          createdBy: row.created_by,
          folderId: row.folder_id,
        }),
    );
  }

  // 단건 조회
  findOne(linkId: string): Link {
    const db = this.databaseService.getDatabase();
    const stmt = db.prepare("SELECT * FROM links WHERE link_id = ?");
    const row = stmt.get(linkId) as LinkRow | undefined;

    if (!row) {
      throw new NotFoundException(`링크를 찾을 수 없습니다: ${linkId}`);
    }

    return new Link({
      linkId: row.link_id,
      teamId: row.team_id,
      url: row.url,
      title: row.title,
      tags: JSON.parse(row.tags) as string[],
      summary: row.summary,
      createdAt: row.created_at,
      createdBy: row.created_by,
      folderId: row.folder_id,
    });
  }

  // 단건 삭제
  remove(linkId: string): void {
    const db = this.databaseService.getDatabase();
    const stmt = db.prepare("DELETE FROM links WHERE link_id = ?");
    const result = stmt.run(linkId);

    if (result.changes === 0) {
      throw new NotFoundException(`링크를 찾을 수 없습니다: ${linkId}`);
    }
  }
}
