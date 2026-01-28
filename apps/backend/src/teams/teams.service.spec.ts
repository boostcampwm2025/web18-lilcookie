import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { TeamsService } from "./teams.service";
import { TeamRepository } from "./repositories/team.repository";
import { Team, TeamMember } from "./entities/team.entity";
import { TeamRole } from "./constants/team-role.constants";

describe("TeamsService", () => {
  let service: TeamsService;
  let repository: jest.Mocked<TeamRepository>;

  // 테스트용 가짜 데이터
  const mockTeam = new Team({
    id: 1,
    uuid: "team-uuid-123",
    name: "테스트팀",
    createdAt: new Date(),
  });

  const mockOwnerMember = new TeamMember({
    teamId: 1,
    userId: 1,
    role: TeamRole.OWNER,
    joinedAt: new Date(),
  });

  const mockMember = new TeamMember({
    teamId: 1,
    userId: 2,
    role: TeamRole.MEMBER,
    joinedAt: new Date(),
  });

  beforeEach(async () => {
    // Mock repository 생성
    const mockRepository = {
      create: jest.fn(),
      addMember: jest.fn(),
      findByUuid: jest.fn(),
      findMember: jest.fn(),
      findTeamsWithRoleByUserId: jest.fn(),
      findMembersByTeamId: jest.fn(),
      removeMember: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamsService, { provide: TeamRepository, useValue: mockRepository }],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
    repository = module.get(TeamRepository);
  });

  describe("create", () => {
    it("팀을 생성하고 생성자를 owner로 추가해야 한다", async () => {
      // Given
      repository.create.mockResolvedValue(mockTeam);
      repository.addMember.mockResolvedValue(mockOwnerMember);

      // When
      const result = await service.create("테스트팀", 1);

      // Then
      expect(result.team).toEqual(mockTeam);
      expect(result.member).toEqual(mockOwnerMember);
      expect(repository.create).toHaveBeenCalledWith("테스트팀");
      expect(repository.addMember).toHaveBeenCalledWith(1, 1, TeamRole.OWNER);
    });
  });

  describe("getMyTeams", () => {
    it("유저가 속한 팀 목록을 반환해야 한다", async () => {
      // Given
      const teamsWithRole = [{ team: mockTeam, role: TeamRole.OWNER }];
      repository.findTeamsWithRoleByUserId.mockResolvedValue(teamsWithRole);

      // When
      const result = await service.getMyTeams(1);

      // Then
      expect(result).toEqual(teamsWithRole);
      expect(repository.findTeamsWithRoleByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe("getTeamByUuid", () => {
    it("UUID로 팀을 찾아 반환해야 한다", async () => {
      // Given
      repository.findByUuid.mockResolvedValue(mockTeam);

      // When
      const result = await service.getTeamByUuid("team-uuid-123");

      // Then
      expect(result).toEqual(mockTeam);
    });

    it("팀이 없으면 NotFoundException을 던져야 한다", async () => {
      // Given
      repository.findByUuid.mockResolvedValue(null);

      // When & Then
      await expect(service.getTeamByUuid("invalid-uuid")).rejects.toThrow(NotFoundException);
    });
  });

  describe("join", () => {
    it("팀에 멤버로 가입해야 한다", async () => {
      // Given
      repository.findByUuid.mockResolvedValue(mockTeam);
      repository.findMember.mockResolvedValue(null); // 아직 멤버 아님
      repository.addMember.mockResolvedValue(mockMember);

      // When
      const result = await service.join("team-uuid-123", 2);

      // Then
      expect(result).toEqual(mockMember);
      expect(repository.addMember).toHaveBeenCalledWith(1, 2, TeamRole.MEMBER);
    });

    it("팀이 없으면 NotFoundException을 던져야 한다", async () => {
      // Given
      repository.findByUuid.mockResolvedValue(null);

      // When & Then
      await expect(service.join("invalid-uuid", 2)).rejects.toThrow(NotFoundException);
    });

    it("이미 팀 멤버면 ConflictException을 던져야 한다", async () => {
      // Given
      repository.findByUuid.mockResolvedValue(mockTeam);
      repository.findMember.mockResolvedValue(mockMember); // 이미 멤버

      // When & Then
      await expect(service.join("team-uuid-123", 2)).rejects.toThrow(ConflictException);
    });
  });

  describe("leave", () => {
    it("팀에서 탈퇴해야 한다", async () => {
      // Given
      repository.findByUuid.mockResolvedValue(mockTeam);
      repository.findMember.mockResolvedValue(mockMember); // 일반 멤버
      repository.removeMember.mockResolvedValue(true);

      // When
      await service.leave("team-uuid-123", 2);

      // Then
      expect(repository.removeMember).toHaveBeenCalledWith(1, 2);
    });

    it("팀이 없으면 NotFoundException을 던져야 한다", async () => {
      // Given
      repository.findByUuid.mockResolvedValue(null);

      // When & Then
      await expect(service.leave("invalid-uuid", 2)).rejects.toThrow(NotFoundException);
    });

    it("팀 멤버가 아니면 NotFoundException을 던져야 한다", async () => {
      // Given
      repository.findByUuid.mockResolvedValue(mockTeam);
      repository.findMember.mockResolvedValue(null); // 멤버 아님

      // When & Then
      await expect(service.leave("team-uuid-123", 2)).rejects.toThrow(NotFoundException);
    });

    it("owner는 탈퇴할 수 없어야 한다", async () => {
      // Given
      repository.findByUuid.mockResolvedValue(mockTeam);
      repository.findMember.mockResolvedValue(mockOwnerMember); // owner

      // When & Then
      await expect(service.leave("team-uuid-123", 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("getMembers", () => {
    it("팀 멤버 목록을 반환해야 한다", async () => {
      // Given
      const members = [mockOwnerMember, mockMember];
      repository.findByUuid.mockResolvedValue(mockTeam);
      repository.findMember.mockResolvedValue(mockMember); // 요청자가 멤버
      repository.findMembersByTeamId.mockResolvedValue(members);

      // When
      const result = await service.getMembers("team-uuid-123", 2);

      // Then
      expect(result).toEqual(members);
    });

    it("팀이 없으면 NotFoundException을 던져야 한다", async () => {
      // Given
      repository.findByUuid.mockResolvedValue(null);

      // When & Then
      await expect(service.getMembers("invalid-uuid", 2)).rejects.toThrow(NotFoundException);
    });

    it("팀 멤버가 아니면 ForbiddenException을 던져야 한다", async () => {
      // Given
      repository.findByUuid.mockResolvedValue(mockTeam);
      repository.findMember.mockResolvedValue(null); // 멤버 아님

      // When & Then
      await expect(service.getMembers("team-uuid-123", 999)).rejects.toThrow(ForbiddenException);
    });
  });
});
