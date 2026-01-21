# 여러 파일로 나누는 방법 있으나, 일단은 main.tf에 모두 작성

terraform {
  required_providers {
    authentik = {
      source = "goauthentik/authentik"
    }
  }
}

provider "authentik" {
  url = "https://auth.localhost"
  # Token 분리하는 방법 조사하여 적용 필요
  # root .env.development.local에도 동일 토큰 포함
  token    = "jhb6XJIm6MZdN1d699RIL9Tqk6ARS41PswgCPulBfIM="
  insecure = true
}

# --- Look up default objects Authentik already provides ---

data "authentik_flow" "default_authorization" {
  slug = "default-provider-authorization-implicit-consent"
}

data "authentik_certificate_key_pair" "default" {
  name = "authentik Self-signed Certificate"
}

data "authentik_flow" "default_invalidation" {
  slug = "default-provider-invalidation-flow"
}

# --- Look up default scopes Authentik already provides ---

data "authentik_property_mapping_provider_scope" "email" {
  name = "authentik default OAuth Mapping: OpenID 'email'"
}

data "authentik_property_mapping_provider_scope" "openid" {
  name = "authentik default OAuth Mapping: OpenID 'openid'"
}

data "authentik_property_mapping_provider_scope" "profile" {
  name = "authentik default OAuth Mapping: OpenID 'profile'"
}

data "authentik_property_mapping_provider_scope" "offline_access" {
  name = "authentik default OAuth Mapping: OpenID 'offline_access'"
}

# --- Custom property mappings for team_id and roles ---

resource "authentik_property_mapping_provider_scope" "team_id" {
  name       = "teamstash-team-id"
  scope_name = "team_id"
  expression = "return {\"team_id\": user.attributes.get(\"team_id\")}"
}

resource "authentik_property_mapping_provider_scope" "roles" {
  name       = "teamstash-roles"
  scope_name = "roles"
  expression = "return { 'roles': user.attributes.get('roles', []) }"
}

resource "authentik_property_mapping_provider_scope" "links_read" {
  name       = "teamstash-links-read"
  scope_name = "links:read"
  expression = "return {}"
}

resource "authentik_property_mapping_provider_scope" "links_write" {
  name       = "teamstash-links-write"
  scope_name = "links:write"
  expression = "return {}"
}

resource "authentik_property_mapping_provider_scope" "ai_use" {
  name       = "teamstash-ai-use"
  scope_name = "ai:use"
  expression = "return {}"
}

resource "authentik_property_mapping_provider_scope" "folders_read" {
  name       = "teamstash-folders-read"
  scope_name = "folders:read"
  expression = "return {}"
}

resource "authentik_property_mapping_provider_scope" "folders_write" {
  name       = "teamstash-folders-write"
  scope_name = "folders:write"
  expression = "return {}"
}

# --- test user ---

resource "authentik_user" "teamstash_user" {
  username  = "testuser"
  name      = "Test User"
  email     = "testuser@example.com"
  password  = "GVggKD7BDY43bRCa36GNfEA9dtNWtH"
  is_active = true

  # Arbitrary JSON attributes
  attributes = jsonencode({
    team_id = "web18"
    roles   = ["admin"]
  })
}

# --- OAuth2 / OIDC Provider ---

resource "authentik_provider_oauth2" "teamstash" {
  name = "teamstash-oauth-provider"

  client_id     = "teamstash-client"
  client_type   = "public"

  authorization_flow = data.authentik_flow.default_authorization.id
  invalidation_flow  = data.authentik_flow.default_invalidation.id
  signing_key        = data.authentik_certificate_key_pair.default.id

  allowed_redirect_uris = [
    # Needs update (must match redirect_uris in application)
    # Just for Terraform testing purpose
    {
      matching_mode = "strict",
      url           = "https://app.localhost/callback",
    },
    {
      matching_mode = "strict",
      url           = "https://app.insomnia.rest/oauth/redirect",
    },
    {
      matching_mode = "strict",
      url           = "https://fdoebkjfodmjkpnfcenaliefhpgpmagg.chromiumapp.org/", #크롬익스텐션 아이디로 변경
    },
  ]

  property_mappings = [
    data.authentik_property_mapping_provider_scope.openid.id,
    data.authentik_property_mapping_provider_scope.profile.id,
    data.authentik_property_mapping_provider_scope.email.id,
    data.authentik_property_mapping_provider_scope.offline_access.id,
    authentik_property_mapping_provider_scope.team_id.id,
    authentik_property_mapping_provider_scope.roles.id,
    authentik_property_mapping_provider_scope.links_read.id,
    authentik_property_mapping_provider_scope.links_write.id,
    authentik_property_mapping_provider_scope.ai_use.id,
    authentik_property_mapping_provider_scope.folders_read.id,
    authentik_property_mapping_provider_scope.folders_write.id
  ]

  sub_mode = "hashed_user_id"
}

# --- Application bound to provider ---

resource "authentik_application" "teamstash" {
  name              = "TeamStash"
  slug              = "teamstash"
  protocol_provider = authentik_provider_oauth2.teamstash.id
}
