import { Injectable } from "@nestjs/common";
import { UserRepository } from "./user.repository";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * 사용자 조회 또는 생성 (OIDC 로그인 시 사용)
   * @param userUuid 사용자 UUID
   * @param userNickname 사용자 닉네임
   * @param userEmail 사용자 이메일 (optional)
   * @returns 사용자 엔티티
   */
  async findOrCreate(userUuid: string, userNickname: string, userEmail?: string): Promise<User> {
    return this.userRepository.upsert({ uuid: userUuid, nickname: userNickname, email: userEmail });
  }
}
