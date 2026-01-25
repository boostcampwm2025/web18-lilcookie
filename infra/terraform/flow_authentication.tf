# --- TeamStash Authentication Flow ---

resource "authentik_flow" "teamstash_authentication_flow" {
  name        = "TeamStash Authentication Flow"
  title       = "Sign In"
  slug        = "teamstash-authentication-flow"
  designation = "authentication"
}

# --- Stage Bindings ---

resource "authentik_flow_stage_binding" "teamstash_auth_identification" {
  target               = authentik_flow.teamstash_authentication_flow.uuid
  stage                = authentik_stage_identification.teamstash_identification_stage.id
  order                = 10
  re_evaluate_policies = true
}

resource "authentik_flow_stage_binding" "teamstash_auth_password" {
  target               = authentik_flow.teamstash_authentication_flow.uuid
  stage                = authentik_stage_password.teamstash_authentication_password.id
  order                = 20
  re_evaluate_policies = true
}

resource "authentik_flow_stage_binding" "teamstash_auth_mfa_validation" {
  target               = authentik_flow.teamstash_authentication_flow.uuid
  stage                = authentik_stage_authenticator_validate.teamstash_authentication_mfa_validation.id
  order                = 30
  re_evaluate_policies = true
}

resource "authentik_flow_stage_binding" "teamstash_auth_login" {
  target               = authentik_flow.teamstash_authentication_flow.uuid
  stage                = authentik_stage_user_login.teamstash_authentication_login.id
  order                = 100
  re_evaluate_policies = true
}

# --- Policy Bindings ---

resource "authentik_policy_binding" "teamstash_auth_password_policy" {
  target  = authentik_flow_stage_binding.teamstash_auth_password.id
  policy  = authentik_policy_expression.teamstash_authentication_password_stage.id
  order   = 10
  timeout = 30
}

resource "authentik_policy_binding" "teamstash_auth_mfa_validation_policy" {
  target  = authentik_flow_stage_binding.teamstash_auth_mfa_validation.id
  policy  = authentik_policy_expression.teamstash_authentication_mfa_validation_stage.id
  order   = 10
  timeout = 30
}
