import { IsString, IsInt, Min, Max, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class TestValidationRequestDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  @Max(150)
  @Type(() => Number)
  age: number;

  @IsOptional()
  @IsString()
  description?: string;
}
