# 우리 서비스 전용 커스텀 속성 매핑 프로바이더 스코프 정의 파일

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

resource "authentik_property_mapping_provider_scope" "teamstash_profile" {
  name       = "teamstash_profile"
  scope_name = "profile"
  expression = <<-PY
return {
    "name": request.user.name,
    "given_name": request.user.name,
    "preferred_username": request.user.username,
    "nickname": request.user.attributes.get("nickname", request.user.username),
    "groups": [group.name for group in request.user.ak_groups.all()],
}
PY
}
