# All Authentik Stage resources

# --- Email Stages ---
resource "authentik_stage_email" "email_account_verification" {
  name                     = "email_account_verification"
  activate_user_on_success = true
  use_global_settings      = true
  token_expiry             = "minutes=15"
  subject                  = "TeamStash Account Verification"
  template                 = "account-verification.html"
  recovery_max_attempts    = 3
  recovery_cache_timeout   = "minutes=10"
}

# --- Prompt Stages ---
resource "authentik_stage_prompt" "teamstash_enrollment_prompt" {
  name = "Teamstash Enrollment Prompt"
  fields = [
    authentik_stage_prompt_field.teamstash_email_field.id,
    authentik_stage_prompt_field.teamstash_password_field.id,
  ]
}

# --- Identification Stages ---
resource "authentik_stage_identification" "teamstash_identification_stage" {
  name        = "TeamStash Identification Stage"
  user_fields = ["username", "email"]
}

# --- User Logout Stages ---
resource "authentik_stage_user_logout" "post_logout_logout_stage" {
  name = "post-logout-user-logout-stage"
}

# --- Redirect Stages ---
resource "authentik_stage_redirect" "post_logout_dummy_redirect" {
  name          = "post-logout-dummy-redirect"
  mode          = "static"
  target_static = "about:blank"
}
