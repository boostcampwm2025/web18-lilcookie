# OAuth2 Provider 및 Application 설정 파일

resource "authentik_provider_oauth2" "teamstash" {
  name        = "teamstash-oauth-provider"
  client_id   = var.oauth_client_id
  client_type = "public"

  authentication_flow = authentik_flow.teamstash_authentication_flow.uuid
  authorization_flow  = data.authentik_flow.default_authorization.id
  invalidation_flow   = authentik_flow.post_logout_redirect.uuid
  signing_key         = data.authentik_certificate_key_pair.default.id

  allowed_redirect_uris = [
    { matching_mode = "strict", url = var.app_redirect_uri },
    { matching_mode = "strict", url = "https://app.insomnia.rest/oauth/redirect" },
    { matching_mode = "strict", url = "https://${var.chrome_extension_id}.chromiumapp.org/" }
  ]

  property_mappings = [
    data.authentik_property_mapping_provider_scope.openid.id,
    authentik_property_mapping_provider_scope.teamstash_profile.id,
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

  sub_mode = "user_uuid"
}

resource "authentik_application" "teamstash" {
  name              = "TeamStash"
  slug              = "teamstash"
  protocol_provider = authentik_provider_oauth2.teamstash.id
}
