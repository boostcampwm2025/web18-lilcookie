import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { WebhookRepository } from "./repositories/webhook.repository";
import { TeamRepository } from "../teams/repositories/team.repository";
import { WebhookResponseDto } from "./dto/webhook.response.dto";
import { TeamRole } from "../teams/constants/team-role.constants";

@Injectable()
export class WebhooksService {
  constructor(
    private readonly webhookRepository: WebhookRepository,
    private readonly teamRepository: TeamRepository,
  ) {}

  /**
   * 팀의 웹훅 목록 조회
   * @param teamUuid 팀 UUID
   * @param userId 요청자 ID
   * @returns 웹훅 응답 DTO 배열
   */
  async findByTeam(teamUuid: string, userId: number): Promise<WebhookResponseDto[]> {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) {
      throw new NotFoundException("해당 팀을 찾을 수 없습니다.");
    }

    const member = await this.teamRepository.findMember(team.teamId, userId);
    if (!member) {
      throw new ForbiddenException("해당 팀에 접근 권한이 없습니다.");
    }

    const webhooks = await this.webhookRepository.findByTeamId(team.teamId);
    return webhooks.map((w) => WebhookResponseDto.from(w));
  }

  /**
   * 웹훅 생성
   * @param teamUuid 팀 UUID
   * @param url 웹훅 URL
   * @param userId 요청자 ID
   * @returns 생성된 웹훅 응답 DTO
   */
  async create(teamUuid: string, url: string, userId: number): Promise<WebhookResponseDto> {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) {
      throw new NotFoundException("해당 팀을 찾을 수 없습니다.");
    }

    const member = await this.teamRepository.findMember(team.teamId, userId);
    if (!member) {
      throw new ForbiddenException("해당 팀에 접근 권한이 없습니다.");
    }

    if (member.role !== TeamRole.OWNER) {
      throw new ForbiddenException("팀 오너만 웹훅을 등록할 수 있습니다.");
    }

    const webhook = await this.webhookRepository.create(team.teamId, url);
    return WebhookResponseDto.from(webhook);
  }

  /**
   * 웹훅 삭제
   * @param teamUuid 팀 UUID
   * @param webhookUuid 웹훅 UUID
   * @param userId 요청자 ID
   */
  async delete(teamUuid: string, webhookUuid: string, userId: number): Promise<void> {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) {
      throw new NotFoundException("해당 팀을 찾을 수 없습니다.");
    }

    const member = await this.teamRepository.findMember(team.teamId, userId);
    if (!member) {
      throw new ForbiddenException("해당 팀에 접근 권한이 없습니다.");
    }

    if (member.role !== TeamRole.OWNER) {
      throw new ForbiddenException("팀 오너만 웹훅을 삭제할 수 있습니다.");
    }

    const webhook = await this.webhookRepository.findByUuid(webhookUuid);
    if (!webhook) {
      throw new NotFoundException("웹훅을 찾을 수 없습니다.");
    }

    if (webhook.teamId !== team.teamId) {
      throw new ForbiddenException("해당 팀의 웹훅이 아닙니다.");
    }

    await this.webhookRepository.delete(webhook.webhookId);
  }

  /**
   * 웹훅 활성화/비활성화
   * @param teamUuid 팀 UUID
   * @param webhookUuid 웹훅 UUID
   * @param userId 요청자 ID
   * @param isActive 활성화 여부
   * @returns 업데이트된 웹훅 응답 DTO
   */
  async setActive(
    teamUuid: string,
    webhookUuid: string,
    userId: number,
    isActive: boolean,
  ): Promise<WebhookResponseDto> {
    const team = await this.teamRepository.findByUuid(teamUuid);
    if (!team) {
      throw new NotFoundException("해당 팀을 찾을 수 없습니다.");
    }

    const member = await this.teamRepository.findMember(team.teamId, userId);
    if (!member) {
      throw new ForbiddenException("해당 팀에 접근 권한이 없습니다.");
    }

    if (member.role !== TeamRole.OWNER) {
      throw new ForbiddenException("팀 오너만 웹훅을 수정할 수 있습니다.");
    }

    const webhook = await this.webhookRepository.findByUuid(webhookUuid);
    if (!webhook) {
      throw new NotFoundException("웹훅을 찾을 수 없습니다.");
    }

    if (webhook.teamId !== team.teamId) {
      throw new ForbiddenException("해당 팀의 웹훅이 아닙니다.");
    }

    const updated = await this.webhookRepository.updateActive(webhook.webhookId, isActive);
    return WebhookResponseDto.from(updated);
  }
}
