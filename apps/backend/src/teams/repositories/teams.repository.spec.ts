import { TeamRepository } from "./team.repository";
import { PrismaService } from "../../database/prisma.service";
import { Prisma } from "@prisma/client";
import { Team, TeamMember } from "../entities/team.entity";

describe("TeamRepository (unit)", () => {
  let repository: TeamRepository;
  let prisma: PrismaService;

  beforeEach(() => {
    // PrismaService를 "형태만" 맞춘 mock
    prisma = {
      team: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      teamMember: {
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;

    repository = new TeamRepository(prisma);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("팀을 생성한다", async () => {
      const teamRow = {
        id: 1,
        uuid: "team-uuid",
        name: "test team",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createSpy = jest.spyOn(prisma.team, "create").mockResolvedValue(teamRow);

      const result = await repository.create("test team");

      expect(result).toBeInstanceOf(Team);
      expect(createSpy).toHaveBeenCalledWith({
        data: { name: "test team" },
      });
    });
  });

  describe("addMember", () => {
    it("팀 멤버를 생성한다", async () => {
      const memberRow = {
        id: 1,
        teamId: 1,
        userId: 10,
        role: "owner",
        joinedAt: new Date(),
      };

      const createSpy = jest.spyOn(prisma.teamMember, "create").mockResolvedValue(memberRow);

      const result = await repository.addMember(1, 10, "owner");

      expect(result).toBeInstanceOf(TeamMember);
      expect(createSpy).toHaveBeenCalledWith({
        data: { teamId: 1, userId: 10, role: "owner" },
      });
    });
  });

  describe("findByUuid", () => {
    it("존재하면 Team 반환", async () => {
      const found = {
        id: 1,
        uuid: "uuid",
        name: "team",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.team, "findUnique").mockResolvedValue(found);

      const result = await repository.findByUuid("uuid");

      expect(result).toBeInstanceOf(Team);
    });

    it("없으면 null 반환", async () => {
      jest.spyOn(prisma.team, "findUnique").mockResolvedValue(null);

      const result = await repository.findByUuid("uuid");

      expect(result).toBeNull();
    });
  });

  describe("addMember", () => {
    it("팀 멤버를 추가한다", async () => {
      const member = {
        id: 1,
        teamId: 1,
        userId: 2,
        role: "owner",
        joinedAt: new Date(),
      };

      jest.spyOn(prisma.teamMember, "create").mockResolvedValue(member);

      const result = await repository.addMember(1, 2, "owner");

      expect(result).toBeInstanceOf(TeamMember);
    });
  });

  describe("removeMember", () => {
    it("삭제 성공 시 true", async () => {
      jest.spyOn(prisma.teamMember, "delete").mockResolvedValue({
        id: 1,
        teamId: 1,
        userId: 2,
        role: "member",
        joinedAt: new Date(),
      });

      const result = await repository.removeMember(1, 2);

      expect(result).toBe(true);
    });

    it("존재하지 않으면 false 반환", async () => {
      jest.spyOn(prisma.teamMember, "delete").mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Not found", {
          code: "P2025",
          clientVersion: "test",
        }),
      );

      const result = await repository.removeMember(1, 999);

      expect(result).toBe(false);
    });
  });

  describe("findMembersByTeamId", () => {
    it("팀 멤버 목록 반환", async () => {
      jest.spyOn(prisma.teamMember, "findMany").mockResolvedValue([
        {
          id: 1,
          teamId: 1,
          userId: 1,
          role: "member",
          joinedAt: new Date(),
        },
      ]);

      const result = await repository.findMembersByTeamId(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(TeamMember);
    });
  });

  describe("findTeamsWithRoleByUserId", () => {
    it("유저의 팀 + 역할을 반환한다", async () => {
      const row: Prisma.TeamMemberGetPayload<{
        include: { team: true };
      }> = {
        id: 1,
        teamId: 1,
        userId: 1,
        role: "owner",
        joinedAt: new Date(),
        team: {
          id: 1,
          uuid: "uuid",
          name: "team",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      jest.spyOn(prisma.teamMember, "findMany").mockResolvedValue([row]);

      const result = await repository.findTeamsWithRoleByUserId(1);

      expect(result).toHaveLength(1);
      expect(result[0].team).toBeInstanceOf(Team);
      expect(result[0].role).toBe("owner");
    });
  });

  describe("findById", () => {
    it("팀 조회", async () => {
      jest.spyOn(prisma.team, "findUnique").mockResolvedValue({
        id: 1,
        uuid: "uuid",
        name: "team",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await repository.findById(1);

      expect(result).toBeInstanceOf(Team);
    });
  });

  describe("findMember", () => {
    it("멤버 조회", async () => {
      jest.spyOn(prisma.teamMember, "findUnique").mockResolvedValue({
        id: 1,
        teamId: 1,
        userId: 1,
        role: "member",
        joinedAt: new Date(),
      });

      const result = await repository.findMember(1, 1);

      expect(result).toBeInstanceOf(TeamMember);
    });
  });
});
