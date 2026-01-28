# --- TeamStash Recovery Flow ---

resource "authentik_flow" "teamstash_recovery_flow" {
  name        = "TeamStash Recovery Flow"
  title       = "Reset Password"
  slug        = "teamstash-recovery-flow"
  designation = "recovery"
}

# --- Stage Bindings ---

resource "authentik_flow_stage_binding" "teamstash_recovery_identification" {
  target               = authentik_flow.teamstash_recovery_flow.uuid
  stage                = authentik_stage_identification.teamstash_recovery_identification_stage.id
  order                = 10
  re_evaluate_policies = true
  evaluate_on_plan     = false
}

resource "authentik_flow_stage_binding" "teamstash_recovery_email" {
  target               = authentik_flow.teamstash_recovery_flow.uuid
  stage                = authentik_stage_email.teamstash_recovery_email.id
  order                = 20
  re_evaluate_policies = true
  evaluate_on_plan     = false
}

resource "authentik_flow_stage_binding" "teamstash_recovery_prompt" {
  target               = authentik_flow.teamstash_recovery_flow.uuid
  stage                = authentik_stage_prompt.teamstash_recovery_prompt.id
  order                = 30
  re_evaluate_policies = true
  evaluate_on_plan     = false
}

resource "authentik_flow_stage_binding" "teamstash_recovery_user_write" {
  target               = authentik_flow.teamstash_recovery_flow.uuid
  stage                = authentik_stage_user_write.teamstash_recovery_write.id
  order                = 40
  re_evaluate_policies = true
  evaluate_on_plan     = false
}

resource "authentik_flow_stage_binding" "teamstash_recovery_login" {
  target               = authentik_flow.teamstash_recovery_flow.uuid
  stage                = authentik_stage_user_login.teamstash_authentication_login.id
  order                = 50
  re_evaluate_policies = true
  evaluate_on_plan     = false
}
