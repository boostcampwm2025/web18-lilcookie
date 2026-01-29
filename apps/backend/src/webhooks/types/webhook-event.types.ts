/**
 * 웹훅으로 전송되는 이벤트 페이로드
 */
export interface WebhookEventPayload {
  event: string;
  timestamp: string;
  data: LinkCreatedEventData;
}

/**
 * link.created 이벤트 데이터
 */
export interface LinkCreatedEventData {
  linkUuid: string;
  url: string;
  title: string;
  summary: string;
  tags: string[];
  teamUuid: string;
  teamName: string;
  folderUuid: string;
  folderName: string;
  createdBy: {
    uuid: string;
    nickname: string;
  };
}
