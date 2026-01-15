import { Controller, Get, Logger } from '@nestjs/common';

// https://www.rfc-editor.org/rfc/rfc8615#section-3
// Well-known URIs are rooted in the top of the path's hierarchy; they
// are not well-known by definition in other parts of the path.  For
// example, "/.well-known/example" is a well-known URI, whereas
// "/foo/.well-known/example" is not.

@Controller('.well-known')
export class WellKnownController {
  private readonly logger = new Logger(WellKnownController.name);

  @Get('openid-configuration')
  getOpenIdConfiguration() {
    this.logger.log('GET /.well-known/openid-configuration - OIDC Discovery');

    const baseUrl = process.env.BASE_URL || 'http://localhost:3002';

    return {
      issuer: baseUrl,
      authorization_endpoint: `${baseUrl}/oauth/authorize`,
      token_endpoint: `${baseUrl}/oauth/token`,
      userinfo_endpoint: `${baseUrl}/oauth/userinfo`,
      jwks_uri: `${baseUrl}/.well-known/jwks.json`,
      response_types_supported: ['code'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      scopes_supported: [
        'openid',
        'profile',
        'email',
        'links:read',
        'links:write',
      ],
      token_endpoint_auth_methods_supported: ['none', 'client_secret_post'],
      code_challenge_methods_supported: ['S256', 'plain'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
    };
  }
}
