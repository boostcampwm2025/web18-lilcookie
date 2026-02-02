import { Test, TestingModule } from "@nestjs/testing";
import { HttpStatus } from "@nestjs/common";
import { TeamsController } from "./teams.controller";
import { TeamsService } from "./teams.service";
import { Team, TeamMember } from "./entities/team.entity";
import { TeamRole } from "./constants/team-role.constants";
import type { AuthenticatedUser } from "../oidc/types/oidc.types";
import type { SuccessResponse } from "../common/builders/response.type";
import type { TeamResponseDto } from "./dto/team.response.dto";

// OidcGuard가 jose 패키지(ESM)를 import하므로 mock 처리
jest.mock("../oidc/guards/oidc.guard", () => ({
  OidcGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe("TeamsController", () => {
  let controller: TeamsController;
  let service: jest.Mocked<TeamsService>;

  const mockUser: AuthenticatedUser = {
    userId: 1,
    sub: "user-sub-123",
    iss: "https://auth.example.com",
    aud: "test-client",
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    nickname: "테스트유저",
    roles: ["user"],
    team_id: null,
    scope: "openid profile",
  };

  const mockTeam = new Team({
    id: 1,
    uuid: "team-uuid-123",
    name: "테스트팀",
    createdAt: new Date("2024-01-01"),
  });

  const mockOwnerMember = new TeamMember({
    teamId: 1,
    userId: 1,
    role: TeamRole.OWNER,
    joinedAt: new Date("2024-01-01"),
  });

  const mockMember = new TeamMember({
    teamId: 1,
    userId: 2,
    role: TeamRole.MEMBER,
    joinedAt: new Date("2024-01-02"),
  });

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      getMyTeams: jest.fn(),
      getTeamByUuid: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
      getMembers: jest.fn(),
    } as unknown as jest.Mocked<TeamsService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        {
          provide: TeamsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
    service = module.get(TeamsService);
  });

  describe("create", () => {
    it("팀을 생성하고 성공 응답을 반환해야 한다", async () => {
      const createSpy = jest.spyOn(service, "create");
      createSpy.mockResolvedValue({ team: mockTeam, member: mockOwnerMember });

      const result = await controller.create({ name: "테스트팀" }, mockUser);

      expect(createSpy).toHaveBeenCalledWith("테스트팀", 1);
      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.message).toBe("팀이 성공적으로 생성되었습니다");

      const successResult = result as SuccessResponse<TeamResponseDto>;
      expect(successResult.data?.uuid).toBe("team-uuid-123");
      expect(successResult.data?.name).toBe("테스트팀");
      expect(successResult.data?.role).toBe(TeamRole.OWNER);
    });
  });

  describe("getMyTeams", () => {
    it("내 팀 목록을 반환해야 한다", async () => {
      const spy = jest.spyOn(service, "getMyTeams");
      spy.mockResolvedValue([{ team: mockTeam, role: TeamRole.OWNER }]);

      const result = await controller.getMyTeams(mockUser);

      expect(spy).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
    });
  });

  describe("getTeamForInvite", () => {
    it("초대용 팀 정보를 반환해야 한다", async () => {
      const spy = jest.spyOn(service, "getTeamByUuid");
      spy.mockResolvedValue(mockTeam);

      const result = await controller.getTeamForInvite("team-uuid-123");

      expect(spy).toHaveBeenCalledWith("team-uuid-123");
      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
    });
  });

  describe("join", () => {
    it("팀에 가입하고 성공 응답을 반환해야 한다", async () => {
      const spy = jest.spyOn(service, "join");
      spy.mockResolvedValue(mockMember);

      const result = await controller.join("team-uuid-123", mockUser);

      expect(spy).toHaveBeenCalledWith("team-uuid-123", 1);
      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
    });
  });

  describe("leave", () => {
    it("팀에서 탈퇴하고 성공 응답을 반환해야 한다", async () => {
      const spy = jest.spyOn(service, "leave");
      spy.mockResolvedValue(undefined);

      const result = await controller.leave("team-uuid-123", mockUser);

      expect(spy).toHaveBeenCalledWith("team-uuid-123", 1);
      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
    });
  });

  describe("getMembers", () => {
    it("팀 멤버 목록을 반환해야 한다", async () => {
      const spy = jest.spyOn(service, "getMembers");
      spy.mockResolvedValue([mockOwnerMember, mockMember]);

      const result = await controller.getMembers("team-uuid-123", mockUser);

      expect(spy).toHaveBeenCalledWith("team-uuid-123", 1);
      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
    });
  });
});
