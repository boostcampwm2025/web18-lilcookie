import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthorizeRequestDto } from './dto/authorize-request.dto';
import { TokenRequestDto } from './dto/token-request.dto';

@Controller('oauth')
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);

  @Get('authorize')
  authorize(@Query() authorizeDto: AuthorizeRequestDto, @Res() res: Response) {
    this.logger.log('GET /oauth/authorize - Mock OAuth authorization request');
    this.logger.log(
      `Client ID: ${authorizeDto.client_id}, Redirect URI: ${authorizeDto.redirect_uri}`,
    );
    this.logger.log(
      `Response Type: ${authorizeDto.response_type}, Scope: ${authorizeDto.scope}`,
    );

    // Mock authorization code for development
    const mockAuthorizationCode = 'mock_auth_code_12345';

    // Build redirect URL with authorization code and state (if provided)
    const redirectUrl = new URL(authorizeDto.redirect_uri);
    redirectUrl.searchParams.append('code', mockAuthorizationCode);

    if (authorizeDto.state) {
      redirectUrl.searchParams.append('state', authorizeDto.state);
    }

    this.logger.log(`Redirecting to: ${redirectUrl.toString()}`);

    // Redirect back to client with authorization code
    return res.redirect(redirectUrl.toString());
  }

  @Post('token')
  @HttpCode(HttpStatus.OK)
  token(@Body() tokenDto: TokenRequestDto) {
    this.logger.log('POST /oauth/token - Mock OAuth token request');
    this.logger.log(
      `Grant type: ${tokenDto.grant_type}, Client ID: ${tokenDto.client_id}`,
    );

    // Mock user claims for ID token
    const mockUserClaims = {
      sub: 'mock-user-id-12345',
      email: 'mock@test.com',
      email_verified: true,
      nickname: 'Mock User',
      given_name: 'Mock',
      family_name: 'User',
      picture: 'https://example.com/avatar.png',
      locale: 'ko-KR',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      aud: tokenDto.client_id,
      iss: process.env.BASE_URL || 'http://localhost:3002',
    };

    // Mock ID token (simplified base64 encoded JSON for development)
    const mockIdToken = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(JSON.stringify(mockUserClaims)).toString('base64')}.mock_signature`;

    // Mock tokens for development
    const mockResponse = {
      access_token: 'mock_access_token_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: 'mock_refresh_token_abcdef123456',
      id_token: mockIdToken,
      scope:
        tokenDto.grant_type === 'authorization_code'
          ? 'openid profile email links:read links:write'
          : 'openid profile email',
    };

    this.logger.log('Returning mock tokens');

    return mockResponse;
  }

  @Get('userinfo')
  getUserInfo() {
    this.logger.log('GET /oauth/userinfo - Mock UserInfo endpoint');

    return {
      sub: 'mock-user-id-12345',
      email: 'mock@test.com',
      email_verified: true,
      nickname: 'Mock User',
      given_name: 'Mock',
      family_name: 'User',
      picture: 'https://example.com/avatar.png',
      locale: 'ko-KR',
    };
  }
}
