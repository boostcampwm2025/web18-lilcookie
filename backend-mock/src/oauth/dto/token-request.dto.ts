import { IsString, IsIn, IsOptional } from 'class-validator';

export class TokenRequestDto {
  @IsString()
  @IsIn(['authorization_code', 'refresh_token'])
  grant_type: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  refresh_token?: string;

  @IsString()
  @IsOptional()
  redirect_uri?: string;

  @IsString()
  client_id: string;

  @IsString()
  @IsOptional()
  code_verifier?: string;
}
