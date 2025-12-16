import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Link } from "./entities/link.entity";
import { CreateLinkRequestDto } from "./dto/create-link.request.dto";

@Injectable()
export class LinksService {
  // MVP 인메모리 저장소 (Map 사용)
  private readonly links: Map<string, Link> = new Map();

  // 새로운 Link 생성
  create(requestDto: CreateLinkRequestDto): Link {
    const linkId = randomUUID();
    const createdAt = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

    const link = new Link({
      linkId,
      teamId: requestDto.teamId,
      url: requestDto.url,
      title: requestDto.title,
      tags: requestDto.tags,
      summary: requestDto.summary,
      createdAt,
      createdBy: requestDto.userId,
    });

    this.links.set(linkId, link);
    return link;
  }

  // 목록 조회 (전체 또는 조건)
  findAll(teamId?: string, tagsQuery?: string, createdAfter?: string): Link[] {
    let links = Array.from(this.links.values());

    // teamId 필터링 (lowercase 비교)
    if (teamId) {
      links = links.filter((link) => link.teamId === teamId.toLowerCase());
    }

    // tags 필터링 (쉼표로 구분된 태그들이 전부 매칭되어야 함)
    if (tagsQuery) {
      const queryTags = tagsQuery.split(",").map((tag) => tag.trim());
      links = links.filter((link) => queryTags.every((queryTag) => link.tags.includes(queryTag)));
    }

    // createdAfter 필터링
    if (createdAfter) {
      const afterDate = this.parseDateString(createdAfter);
      if (!isNaN(afterDate.getTime())) {
        links = links.filter((link) => {
          const linkDate = this.parseDateString(link.createdAt);
          return !isNaN(linkDate.getTime()) && linkDate > afterDate;
        });
      }
    }

    return links;
  }

  private parseDateString(dateString: string): Date {
    const regex = /(\d{4})\. (\d{1,2})\. (\d{1,2})\. (오전|오후) (\d{1,2}):(\d{1,2}):(\d{1,2})/;
    const match = dateString.match(regex);

    if (!match) {
      return new Date(NaN);
    }

    const year = parseInt(match[1]);
    const month = parseInt(match[2]) - 1;
    const day = parseInt(match[3]);
    const meridiem = match[4];
    let hour = parseInt(match[5]);
    const minute = parseInt(match[6]);
    const second = parseInt(match[7]);

    if (meridiem === "오후" && hour !== 12) {
      hour += 12;
    } else if (meridiem === "오전" && hour === 12) {
      hour = 0;
    }

    return new Date(year, month, day, hour, minute, second);
  }

  // 단건 조회
  findOne(linkId: string): Link {
    const link = this.links.get(linkId);
    if (!link) {
      throw new NotFoundException(`링크를 찾을 수 없습니다: ${linkId}`);
    }
    return link;
  }

  // 단건 삭제
  remove(linkId: string): void {
    const exists = this.links.has(linkId);
    if (!exists) {
      throw new NotFoundException(`링크를 찾을 수 없습니다: ${linkId}`);
    }
    this.links.delete(linkId);
  }
}
