import { IsString, IsOptional, IsIn } from 'class-validator';


// https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
export class AuthorizeRequestDto {
  @IsString()
  client_id: string;

  @IsString()
  redirect_uri: string;

  @IsString()
  @IsIn([
    'code',
    'token',
    'id_token',
    'code id_token',
    'code token',
    'id_token token',
    'code id_token token',
  ])
  response_type: string;

  @IsString()
  scope: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  nonce?: string;

  @IsString()
  @IsOptional()
  code_challenge?: string;

  @IsString()
  @IsOptional()
  @IsIn(['S256', 'plain'])
  code_challenge_method?: string;

  @IsString()
  @IsOptional()
  prompt?: string;
}
