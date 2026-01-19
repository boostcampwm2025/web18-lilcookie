export class SignupResponseDto {
  uuid: string;
  email: string;
  nickname: string;

  private constructor(partial: Partial<SignupResponseDto>) {
    Object.assign(this, partial);
  }

  static from(uuid: string, email: string, nickname: string) {
    return new SignupResponseDto({
      uuid,
      email,
      nickname,
    });
  }
}
