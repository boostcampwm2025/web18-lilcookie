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
   * @returns 사용자 엔티티
   */
  async findOrCreate(userUuid: string, userNickname: string): Promise<User> {
    return this.userRepository.upsert({ uuid: userUuid, nickname: userNickname });
  }

  /**
   * ID로 사용자 조회
   * @param userId 사용자 ID (PK)
   * @return 사용자 엔티티
   */
  async findById(userId: number): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  /**
   * UUID로 사용자 조회
   * @param userUuid 사용자 UUID
   * @return 사용자 엔티티
   */
  async findByUuid(userUuid: string): Promise<User | null> {
    return this.userRepository.findByUuid(userUuid);
  }
}
