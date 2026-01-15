export class MeResponseDto {
  uuid: string;
  email: string;
  nickname: string;

  private constructor(partial: Partial<MeResponseDto>) {
    Object.assign(this, partial);
  }

  static from(uuid: string, email: string, nickname: string) {
    return new MeResponseDto({
      uuid,
      email,
      nickname,
    });
  }
}
