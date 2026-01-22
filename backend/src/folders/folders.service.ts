import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { Folder } from "./entities/folder.entity";
import { UpdateFolderRequestDto } from "./dto/update-folder.request.dto";
import { ConfigService } from "@nestjs/config";
import { FolderRepository } from "./repositories/folder.repository";
import { TeamRepository } from "../teams/repositories/team.repository";

@Injectable()
export class FoldersService implements OnModuleInit {
  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly configService: ConfigService,
    private readonly teamRepository: TeamRepository,
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
      { teamId: 1, name: "프론트엔드", createdBy: 1 },
      { teamId: 1, name: "백엔드", createdBy: 1 },
      { teamId: 1, name: "디자인", createdBy: 2 },
    ];

    for (const mock of mockFolders) {
      await this.folderRepository.create(mock);
    }
  }

  // 폴더 생성
  async create(teamUuid: string, folderName: string, userId: number): Promise<Folder> {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) throw new NotFoundException("팀이 존재하지 않습니다");

    return this.folderRepository.create({
      teamId: team.id, // 여기서만 id 사용
      name: folderName,
      createdBy: userId,
    });
  }

  // 팀의 모든 폴더 조회
  async findAllByTeam(teamUuid: string): Promise<Folder[]> {
    return this.folderRepository.findAllByTeam(teamUuid);
  }

  // 특정 폴더 조회
  async findOne(uuid: string): Promise<Folder> {
    const folder = await this.folderRepository.findByUuid(uuid);

    if (!folder) {
      throw new NotFoundException(`폴더를 찾을 수 없습니다: ${uuid}`);
    }

    return folder;
  }

  // 폴더 이름 수정
  async update(uuid: string, requestDto: UpdateFolderRequestDto): Promise<Folder> {
    await this.findOne(uuid);
    const updated = await this.folderRepository.update(uuid, requestDto.folderName);
    if (!updated) {
      throw new NotFoundException(`폴더를 찾을 수 없습니다: ${uuid}`);
    }
    return updated;
  }

  // 폴더 삭제 (하위 폴더와 링크도 함께 처리됨)
  async remove(uuid: string): Promise<void> {
    // 폴더 존재 확인
    await this.findOne(uuid);
    const removed = await this.folderRepository.remove(uuid);
    if (!removed) {
      throw new NotFoundException(`폴더를 찾을 수 없습니다: ${uuid}`);
    }
  }
}
