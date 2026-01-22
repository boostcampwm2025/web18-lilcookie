# 테라폼 및 Authentik 프로바이더 설정 파일

terraform {
  required_providers {
    authentik = {
      source = "goauthentik/authentik"
    }
  }
}

provider "authentik" {
  url      = var.authentik_url
  token    = var.authentik_token
  insecure = true
}
