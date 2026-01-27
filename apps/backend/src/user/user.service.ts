import { Injectable } from "@nestjs/common";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findOrCreate(uuid: string, nickname: string) {
    return this.userRepository.upsert({ uuid, nickname });
  }
}
