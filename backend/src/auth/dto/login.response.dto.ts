export class LoginResponseDto {
  userId: string;
  email: string;
  nickname: string;

  private constructor(userId: string, email: string, nickname: string) {
    this.userId = userId;
    this.email = email;
    this.nickname = nickname;
  }

  static from(userId: string, email: string, nickname: string): LoginResponseDto {
    return new LoginResponseDto(userId, email, nickname);
  }
}
