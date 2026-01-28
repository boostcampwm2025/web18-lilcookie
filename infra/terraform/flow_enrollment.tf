
resource "authentik_flow" "teamstash_enrollment_flow" {
  name        = "TeamStash Enrollment Flow"
  title       = "Sign Up"
  slug        = "teamstash-enrollment-flow"
  designation = "enrollment"
}


# --- Stage Bindings ---

resource "authentik_flow_stage_binding" "teamstash_enrollment_prompt_binding" {
  target               = authentik_flow.teamstash_enrollment_flow.uuid
  stage                = authentik_stage_prompt.teamstash_enrollment_prompt.id
  order                = 10
  re_evaluate_policies = true
  evaluate_on_plan     = false
}

resource "authentik_flow_stage_binding" "teamstash_enrollment_user_write_binding" {
  target               = authentik_flow.teamstash_enrollment_flow.uuid
  stage                = authentik_stage_user_write.teamstash_user_write_stage.id
  order                = 20
  re_evaluate_policies = true
  evaluate_on_plan     = false
}

resource "authentik_flow_stage_binding" "teamstash_enrollment_email_verification_binding" {
  target               = authentik_flow.teamstash_enrollment_flow.uuid
  stage                = authentik_stage_email.email_account_verification.id
  order                = 30
  re_evaluate_policies = true
  evaluate_on_plan     = false
}
