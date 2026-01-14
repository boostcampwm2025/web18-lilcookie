import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Folder } from "./entities/folder.entity";
import { CreateFolderRequestDto } from "./dto/create-folder.request.dto";
import { UpdateFolderRequestDto } from "./dto/update-folder.request.dto";
import { ConfigService } from "@nestjs/config";
import { FolderRepository } from "./repositories/folder.repository";

@Injectable()
export class FoldersService implements OnModuleInit {
  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly configService: ConfigService,
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
    const existingFolders = await this.folderRepository.findAll();
    if (existingFolders.length > 0) {
      return;
    }

    // Mock 폴더 데이터
    const mockFolders = [
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
        parentFolderId: "folder-web01-frontend",
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

    for (const mockFolder of mockFolders) {
      await this.folderRepository.create(
        new Folder({
          folderId: mockFolder.folderId,
          teamId: mockFolder.teamId,
          folderName: mockFolder.folderName,
          parentFolderId: mockFolder.parentFolderId,
          createdAt: mockFolder.createdAt,
          createdBy: mockFolder.createdBy,
        }),
      );
    }
  }

  // 폴더 생성
  async create(requestDto: CreateFolderRequestDto): Promise<Folder> {
    const folderId = randomUUID();
    const createdAt = new Date().toISOString();

    // 부모 폴더가 있으면 존재하는지 확인
    if (requestDto.parentFolderId) {
      const parentExists = await this.folderRepository.findOne(requestDto.parentFolderId);

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

    return this.folderRepository.create(folder);
  }

  // 팀의 모든 폴더 조회
  async findAllByTeam(teamId: string): Promise<Folder[]> {
    return this.folderRepository.findAllByTeam(teamId);
  }

  // 특정 폴더 조회
  async findOne(folderId: string): Promise<Folder> {
    const folder = await this.folderRepository.findOne(folderId);

    if (!folder) {
      throw new NotFoundException(`폴더를 찾을 수 없습니다: ${folderId}`);
    }

    return folder;
  }

  // 폴더 이름 수정
  async update(folderId: string, requestDto: UpdateFolderRequestDto): Promise<Folder> {
    // 폴더 존재 확인
    await this.findOne(folderId);

    const updated = await this.folderRepository.update(folderId, requestDto.folderName);

    if (!updated) {
      throw new NotFoundException(`폴더를 찾을 수 없습니다: ${folderId}`);
    }

    return updated;
  }

  // 폴더 삭제 (하위 폴더와 링크도 함께 처리됨)
  async remove(folderId: string): Promise<void> {
    // 폴더 존재 확인
    await this.findOne(folderId);

    const removed = await this.folderRepository.remove(folderId);

    if (!removed) {
      throw new NotFoundException(`폴더를 찾을 수 없습니다: ${folderId}`);
    }
  }

  // 특정 폴더의 하위 폴더 조회
  async findSubfolders(parentFolderId: string): Promise<Folder[]> {
    return this.folderRepository.findSubfolders(parentFolderId);
  }
}
