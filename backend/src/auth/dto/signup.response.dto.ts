export class SignupResponseDto {
  userId: string;
  email: string;
  nickname: string;

  constructor(partial: Partial<SignupResponseDto>) {
    Object.assign(this, partial);
  }

  static from(userId: string, email: string, nickname: string): SignupResponseDto {
    return new SignupResponseDto({
      userId,
      email,
      nickname,
    });
  }
}
