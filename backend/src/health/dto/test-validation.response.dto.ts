export class TestValidationResponseDto {
  received: {
    name: string;
    age: number;
    description?: string;
  };

  constructor(partial: Partial<TestValidationResponseDto>) {
    Object.assign(this, partial);
  }

  static from(dto: { name: string; age: number; description?: string }): TestValidationResponseDto {
    return new TestValidationResponseDto({
      received: dto,
    });
  }
}
