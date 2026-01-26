export class CreateLinkResponseDto {
  id: number;
  createdAt: Date;

  constructor(partial: Partial<CreateLinkResponseDto>) {
    Object.assign(this, partial);
  }

  static from(id: number, createdAt: Date): CreateLinkResponseDto {
    return new CreateLinkResponseDto({
      id,
      createdAt,
    });
  }
}
