# 환경마다 달라질 수 있는 값을 정의하는 변수 파일

# Authentik 인스턴스 정보
variable "authentik_token" {
  type      = string
  sensitive = true
}

# Authentik 인스턴스 URL
variable "authentik_url" {
  type    = string
  default = "https://auth.localhost"
}

# ---테스트용 사용자 계정 정보---
variable "test_user_username" {
  type    = string
  default = "testuser"
}

variable "test_user_name" {
  type    = string
  default = "Test User"
}

variable "test_user_email" {
  type    = string
  default = "testuser@example.com"
}

variable "test_user_password" {
  type      = string
  sensitive = true
}

variable "test_user_team" {
  type    = string
  default = "test-team"
}

# ----------------------------------

# OAuth2 Provider 설정 변수
variable "oauth_client_id" {
  type    = string
  default = "teamstash-client"
}

# OAuth Redirect URI 설정 변수
variable "app_redirect_uri" {
  type    = string
  default = "https://app.localhost/auth/callback"
}

# Chrome Extension ID 설정 변수
variable "chrome_extension_id" {
  type = string
}
