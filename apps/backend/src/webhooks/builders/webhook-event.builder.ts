import { Link } from "../../links/entities/link.entity";
import { User } from "../../user/entities/user.entity";
import { Team } from "../../teams/entities/team.entity";
import { Folder } from "../../folders/entities/folder.entity";
import { WebhookEventPayload } from "../types/webhook-event.types";

/**
 * 웹훅 이벤트 빌더
 */
export class WebhookEventBuilder {
  static linkCreated(link: Link, creator: User, team: Team, folder: Folder): WebhookEventPayload {
    return {
      event: "link.created",
      timestamp: new Date().toISOString(),
      data: {
        linkUuid: link.linkUuid,
        url: link.linkUrl,
        title: link.linkTitle,
        summary: link.linkSummary,
        tags: link.getParsedTags(),
        teamUuid: team.teamUuid,
        teamName: team.teamName,
        folderUuid: folder.folderUuid,
        folderName: folder.folderName,
        createdBy: {
          uuid: creator.userUuid,
          nickname: creator.userNickname,
        },
      },
    };
  }
}
