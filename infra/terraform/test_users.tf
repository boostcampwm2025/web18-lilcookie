# 테스트용 사용자 계정 생성

resource "authentik_user" "teamstash_user" {
  username  = var.test_user_username
  name      = var.test_user_name
  email     = var.test_user_email
  password  = var.test_user_password
  is_active = true

  attributes = jsonencode({
    team_id = var.test_user_team
    roles   = ["admin"]
  })
}
