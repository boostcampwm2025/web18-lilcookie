import { User } from "../entities/user.entity";

/**
 * 사용자 생성 또는 업데이트용 입력 타입
 */
export interface UpsertUserInput {
  uuid: string;
  email?: string | null;
  nickname: string;
}
