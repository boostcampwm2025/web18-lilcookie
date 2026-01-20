export class LoginResponseDto {
  uuid: string;
  email: string;
  nickname: string;

  private constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }

  static from(uuid: string, email: string, nickname: string) {
    return new LoginResponseDto({
      uuid,
      email,
      nickname,
    });
  }
}
