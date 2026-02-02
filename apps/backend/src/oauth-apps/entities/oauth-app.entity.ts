/**
 * OAuth App 엔티티
 */
export class OAuthApp {
  oauthAppId: number;
  oauthAppUuid: string;
  name: string;
  clientId: string;
  redirectUris: string[];
  scopes: string;
  isActive: boolean;
  createdAt: Date;
  authentikProviderId: number;
  authentikAppId: string;
  ownerId: number;

  constructor(partial: Partial<OAuthApp>) {
    Object.assign(this, partial);
  }
}
