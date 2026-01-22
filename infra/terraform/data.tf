# Authentik에 이미 존재하는 기본 리소스들을 조회하는 데이터 소스 파일

# --- 기본 Flow 조회 ---
data "authentik_flow" "default_authorization" {
  slug = "default-provider-authorization-implicit-consent"
}

data "authentik_flow" "default_invalidation" {
  slug = "default-provider-invalidation-flow"
}

# 기본 인증서 조회 
data "authentik_certificate_key_pair" "default" {
  name = "authentik Self-signed Certificate"
}

# --- 기본 스코프 매핑 조회 ---
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
