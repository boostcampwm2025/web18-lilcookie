import { Injectable } from "@nestjs/common";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findOrCreate(uuid: string, nickname: string) {
    let user = await this.userRepository.findByUuid(uuid);

    if (!user) {
      user = await this.userRepository.create({ uuid, nickname });
    }

    return user;
  }
}
