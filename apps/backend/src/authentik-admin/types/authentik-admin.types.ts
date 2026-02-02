/**
 * Authentik Admin API 관련 타입 정의
 */

// OAuth2 Provider

export interface CreateOAuthProviderParams {
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
}

export interface AuthentikOAuth2ProviderResponse {
  pk: number;
  name: string;
  client_id: string;
  client_secret: string;
  redirect_uris: string;
  authorization_flow: string;
  property_mappings: string[];
}

export interface CreateOAuthProviderResult {
  providerId: number;
  clientId: string;
  clientSecret: string;
  issuer: string;
  jwksUrl: string;
}

// Application

export interface CreateApplicationParams {
  name: string;
  slug: string;
  providerId: number;
}

export interface AuthentikApplicationResponse {
  pk: string;
  name: string;
  slug: string;
  provider: number;
}

export interface CreateApplicationResult {
  applicationId: string;
  slug: string;
}

// Flow

export interface AuthentikFlowResponse {
  pk: string;
  slug: string;
  name: string;
}

export interface AuthentikFlowListResponse {
  pagination: AuthentikPagination;
  results: AuthentikFlowResponse[];
}

// Certificate Key Pair

export interface AuthentikCertificateKeyPairResponse {
  pk: string;
  name: string;
  certificate_data: string;
  private_key_available: boolean;
}

export interface AuthentikCertificateKeyPairListResponse {
  pagination: AuthentikPagination;
  results: AuthentikCertificateKeyPairResponse[];
}

// Property Mapping

export interface AuthentikPropertyMappingResponse {
  pk: string;
  name: string;
  scope_name: string;
}

export interface AuthentikPropertyMappingListResponse {
  pagination: AuthentikPagination;
  results: AuthentikPropertyMappingResponse[];
}

// Common

export interface AuthentikPagination {
  count: number;
  current: number;
  total_pages: number;
}

// OAuth App 생성 전체 결과

export interface CreateOAuthAppResult {
  providerId: number;
  applicationId: string;
  clientId: string;
  clientSecret: string;
  issuer: string;
  jwksUrl: string;
}
