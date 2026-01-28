export class CreateLinkResponseDto {
  uuid: string;
  createdAt: Date;

  constructor(partial: Partial<CreateLinkResponseDto>) {
    Object.assign(this, partial);
  }

  static from(uuid: string, createdAt: Date): CreateLinkResponseDto {
    return new CreateLinkResponseDto({
      uuid,
      createdAt,
    });
  }
}
