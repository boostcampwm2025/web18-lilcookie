# All Authentik Prompt Field resources

resource "authentik_stage_prompt_field" "teamstash_email_field" {
  name      = "teamstash-user-email"
  field_key = "email"
  label     = "Email"
  type      = "email"
  order     = 100
}

resource "authentik_stage_prompt_field" "teamstash_nickname_field" {
  name      = "teamstash-user-nickname"
  field_key = "nickname"
  label     = "Nickname"
  type      = "text"
  order     = 200
}

resource "authentik_stage_prompt_field" "teamstash_password_field" {
  name      = "teamstash-user-password"
  field_key = "password"
  label     = "Password"
  type      = "password"
  order     = 300
}

resource "authentik_stage_prompt_field" "teamstash_password_repeat_field" {
  name        = "teamstash-password-repeat"
  field_key   = "password_repeat"
  label       = "Password (repeat)"
  placeholder = "Password (repeat)"
  type        = "password"
  required    = true
  order       = 301
}
