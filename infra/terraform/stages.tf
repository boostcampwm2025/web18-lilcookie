# All Authentik Stage resources

# --- Authenticator Validate Stages ---
resource "authentik_stage_authenticator_validate" "teamstash_authentication_mfa_validation" {
  name = "teamstash-authentication-mfa-validation"
  device_classes = [
    "static",
    "totp",
    "webauthn",
    "duo",
    "sms",
    "email",
  ]
  not_configured_action      = "skip"
  webauthn_user_verification = "preferred"
}

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

# --- Identification Stages ---
resource "authentik_stage_identification" "teamstash_identification_stage" {
  name                      = "TeamStash Identification Stage"
  user_fields               = ["email", "username"]
  case_insensitive_matching = true
  pretend_user_exists       = true
  show_matched_user         = true
}

# --- Password Stages ---
resource "authentik_stage_password" "teamstash_authentication_password" {
  name = "teamstash-authentication-password"
  backends = [
    # User database + standard password
    "authentik.core.auth.InbuiltBackend",
    # User database + app passwords
    "authentik.core.auth.TokenBackend",
    # User database + LDAP password
    "authentik.sources.ldap.auth.LDAPBackend",
    # User database + Kerberos password
    "authentik.sources.kerberos.auth.KerberosBackend",
  ]
  failed_attempts_before_cancel = 5
  configure_flow                = authentik_flow.teamstash_password_change.uuid
}

# --- Prompt Stages ---
resource "authentik_stage_prompt" "teamstash_enrollment_prompt" {
  name = "Teamstash Enrollment Prompt"
  fields = [
    authentik_stage_prompt_field.teamstash_email_field.id,
    authentik_stage_prompt_field.teamstash_password_field.id,
  ]
  validation_policies = [
    authentik_policy_password.teamstash_password_policy.id,
  ]
}

resource "authentik_stage_prompt" "teamstash_password_change_prompt" {
  name = "teamstash-password-change-prompt"
  fields = [
    authentik_stage_prompt_field.teamstash_password_field.id,
    authentik_stage_prompt_field.teamstash_password_repeat_field.id,
  ]
  validation_policies = [
    authentik_policy_password.teamstash_password_policy.id,
  ]
}

# --- Redirect Stages ---
resource "authentik_stage_redirect" "post_logout_dummy_redirect" {
  name          = "post-logout-dummy-redirect"
  mode          = "static"
  target_static = "about:blank"
}

# --- User Logout Stages ---
resource "authentik_stage_user_logout" "post_logout_logout_stage" {
  name = "post-logout-user-logout-stage"
}

# --- User Login Stages ---
resource "authentik_stage_user_login" "teamstash_authentication_login" {
  name             = "teamstash-authentication-login"
  session_duration = "seconds=0"
}

# --- User Write Stages ---
resource "authentik_stage_user_write" "teamstash_user_write_stage" {
  name = "Teamstash User Write Stage"
  # users created via this stage will be inactive until they verify their email
  create_users_as_inactive = true
  user_type                = "external"
  create_users_group       = authentik_group.teamstash_group.id
}

resource "authentik_stage_user_write" "teamstash_password_change_write" {
  name               = "teamstash-password-change-write"
  user_creation_mode = "never_create"
  user_type          = "external"
}
