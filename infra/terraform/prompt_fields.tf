# All Authentik Prompt Field resources

resource "authentik_stage_prompt_field" "teamstash_email_field" {
  name      = "teamstash-user-email"
  field_key = "email"
  label     = "Email"
  type      = "email"
  order     = 100
}

resource "authentik_stage_prompt_field" "teamstash_password_field" {
  name      = "teamstash-user-password"
  field_key = "password"
  label     = "Password"
  type      = "password"
  order     = 301
}
