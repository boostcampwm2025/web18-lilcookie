import { User } from "../entities/user.entity";

/**
 * 사용자 생성 또는 업데이트용 입력 타입
 */
export interface UpsertUserInput {
  uuid: string;
  nickname: string;
}

/**
 * 간단한 사용자 정보 타입 (createdBy 등에 사용)
 */
export interface SimpleUserInfo {
  userUuid: string;
  userName: string;
}

/**
 * 사용자 조회 결과 타입
 */
export type UserResult = User | null;
