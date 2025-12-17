export class CreateLinkResponseDto {
  linkId: string;
  createdAt: string;

  constructor(partial: Partial<CreateLinkResponseDto>) {
    Object.assign(this, partial);
  }

  static from(linkId: string, createdAt: string): CreateLinkResponseDto {
    return new CreateLinkResponseDto({
      linkId,
      createdAt,
    });
  }
}
