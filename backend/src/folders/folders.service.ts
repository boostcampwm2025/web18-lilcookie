import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { randomUUID } from "crypto";
import { DatabaseService } from "../database/database.service";
import { Folder } from "./entities/folder.entity";
import { CreateFolderRequestDto } from "./dto/create-folder.request.dto";
import { UpdateFolderRequestDto } from "./dto/update-folder.request.dto";
import { ConfigService } from "@nestjs/config";

// DB에서 가져온 폴더 데이터 타입
interface FolderRow {
  folder_id: string;
  team_id: string;
  folder_name: string;
  parent_folder_id: string | null;
  created_at: string;
  created_by: string;
}

@Injectable()
export class FoldersService implements OnModuleInit {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
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
    const count = db.prepare("SELECT COUNT(*) as count FROM folders").get() as { count: number };
    if (count.count > 0) {
      return;
    }

    // Mock 폴더 데이터
    const mockFolders = [
      // web01 팀의 폴더들
      {
        folderId: "folder-web01-frontend",
        teamId: "web01",
        folderName: "프론트엔드",
        parentFolderId: null,
        createdBy: "J001",
        createdAt: "2025-12-01T00:00:00.000Z",
      },
      {
        folderId: "folder-web01-backend",
        teamId: "web01",
        folderName: "백엔드",
        parentFolderId: null,
        createdBy: "J001",
        createdAt: "2025-12-01T01:00:00.000Z",
      },
      {
        folderId: "folder-web01-react",
        teamId: "web01",
        folderName: "React",
        parentFolderId: "folder-web01-frontend", // 프론트엔드의 하위 폴더
        createdBy: "J002",
        createdAt: "2025-12-01T02:00:00.000Z",
      },
      {
        folderId: "folder-web01-design",
        teamId: "web01",
        folderName: "디자인",
        parentFolderId: null,
        createdBy: "J003",
        createdAt: "2025-12-01T03:00:00.000Z",
      },
    ];

    mockFolders.forEach((mockFolder) => {
      const insertStmt = db.prepare(`
        INSERT INTO folders (folder_id, team_id, folder_name, parent_folder_id, created_at, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      insertStmt.run(
        mockFolder.folderId,
        mockFolder.teamId,
        mockFolder.folderName,
        mockFolder.parentFolderId,
        mockFolder.createdAt,
        mockFolder.createdBy,
      );
    });
  }

  // 폴더 생성
  create(requestDto: CreateFolderRequestDto): Folder {
    const db = this.databaseService.getDatabase();
    const folderId = randomUUID();
    const createdAt = new Date().toISOString();

    // 부모 폴더가 있으면 존재하는지 확인
    if (requestDto.parentFolderId) {
      const parentExists = db
        .prepare("SELECT folder_id FROM folders WHERE folder_id = ?")
        .get(requestDto.parentFolderId);

      if (!parentExists) {
        throw new NotFoundException(`부모 폴더를 찾을 수 없습니다: ${requestDto.parentFolderId}`);
      }
    }

    const folder = new Folder({
      folderId,
      teamId: requestDto.teamId,
      folderName: requestDto.folderName,
      parentFolderId: requestDto.parentFolderId || null,
      createdAt,
      createdBy: requestDto.userId,
    });

    const insertStmt = db.prepare(`
      INSERT INTO folders (folder_id, team_id, folder_name, parent_folder_id, created_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      folder.folderId,
      folder.teamId,
      folder.folderName,
      folder.parentFolderId,
      folder.createdAt,
      folder.createdBy,
    );

    return folder;
  }

  // 팀의 모든 폴더 조회
  findAllByTeam(teamId: string): Folder[] {
    const db = this.databaseService.getDatabase();
    const stmt = db.prepare("SELECT * FROM folders WHERE team_id = ? ORDER BY created_at ASC");
    const rows = stmt.all(teamId) as FolderRow[];

    return rows.map(
      (row) =>
        new Folder({
          folderId: row.folder_id,
          teamId: row.team_id,
          folderName: row.folder_name,
          parentFolderId: row.parent_folder_id,
          createdAt: row.created_at,
          createdBy: row.created_by,
        }),
    );
  }

  // 특정 폴더 조회
  findOne(folderId: string): Folder {
    const db = this.databaseService.getDatabase();
    const stmt = db.prepare("SELECT * FROM folders WHERE folder_id = ?");
    const row = stmt.get(folderId) as FolderRow | undefined;

    if (!row) {
      throw new NotFoundException(`폴더를 찾을 수 없습니다: ${folderId}`);
    }

    return new Folder({
      folderId: row.folder_id,
      teamId: row.team_id,
      folderName: row.folder_name,
      parentFolderId: row.parent_folder_id,
      createdAt: row.created_at,
      createdBy: row.created_by,
    });
  }

  // 폴더 이름 수정
  update(folderId: string, requestDto: UpdateFolderRequestDto): Folder {
    const db = this.databaseService.getDatabase();

    // 폴더 존재 확인
    this.findOne(folderId);

    const updateStmt = db.prepare(`
      UPDATE folders
      SET folder_name = ?
      WHERE folder_id = ?
    `);

    const result = updateStmt.run(requestDto.folderName, folderId);

    if (result.changes === 0) {
      throw new NotFoundException(`폴더를 찾을 수 없습니다: ${folderId}`);
    }

    // 수정된 폴더 반환
    return this.findOne(folderId);
  }

  // 폴더 삭제 (하위 폴더와 링크도 함께 처리됨)
  remove(folderId: string): void {
    const db = this.databaseService.getDatabase();

    // 폴더 존재 확인
    this.findOne(folderId);

    const deleteStmt = db.prepare("DELETE FROM folders WHERE folder_id = ?");
    const result = deleteStmt.run(folderId);

    if (result.changes === 0) {
      throw new NotFoundException(`폴더를 찾을 수 없습니다: ${folderId}`);
    }
  }

  // 특정 폴더의 하위 폴더 조회
  findSubfolders(parentFolderId: string): Folder[] {
    const db = this.databaseService.getDatabase();
    const stmt = db.prepare("SELECT * FROM folders WHERE parent_folder_id = ? ORDER BY created_at ASC");
    const rows = stmt.all(parentFolderId) as FolderRow[];

    return rows.map(
      (row) =>
        new Folder({
          folderId: row.folder_id,
          teamId: row.team_id,
          folderName: row.folder_name,
          parentFolderId: row.parent_folder_id,
          createdAt: row.created_at,
          createdBy: row.created_by,
        }),
    );
  }
}
