# OAuth2 Provider 및 Application 설정 파일

resource "authentik_provider_oauth2" "teamstash" {
  name        = "teamstash-oauth-provider"
  client_id   = var.oauth_client_id
  client_type = "public"

  # 토큰 유효기간 설정 추가
  access_token_validity  = "hours=1" 
  refresh_token_validity = "days=30"
  
  authentication_flow = authentik_flow.teamstash_authentication_flow.uuid
  authorization_flow  = data.authentik_flow.default_authorization.id
  invalidation_flow   = authentik_flow.post_logout_redirect.uuid
  signing_key         = data.authentik_certificate_key_pair.default.id

  allowed_redirect_uris = var.allowed_redirect_uris

  property_mappings = [
    data.authentik_property_mapping_provider_scope.openid.id,
    authentik_property_mapping_provider_scope.teamstash_profile.id,
    data.authentik_property_mapping_provider_scope.email.id,
    data.authentik_property_mapping_provider_scope.offline_access.id,
    authentik_property_mapping_provider_scope.links_read.id,
    authentik_property_mapping_provider_scope.links_write.id,
    authentik_property_mapping_provider_scope.ai_use.id,
    authentik_property_mapping_provider_scope.folders_read.id,
    authentik_property_mapping_provider_scope.folders_write.id
  ]

  sub_mode = "user_uuid"
}

resource "authentik_application" "teamstash" {
  name              = "TeamStash"
  slug              = "teamstash"
  protocol_provider = authentik_provider_oauth2.teamstash.id
}
