# --- TeamStash Unenrollment Flow ---

resource "authentik_flow" "teamstash_unenrollment_flow" {
  name           = "TeamStash Unenrollment Flow"
  title          = "Delete your account"
  slug           = "teamstash-unenrollment-flow"
  designation    = "unenrollment"
  authentication = "require_authenticated"
}

# --- Stage Bindings ---

resource "authentik_flow_stage_binding" "teamstash_unenrollment_prompt" {
  target               = authentik_flow.teamstash_unenrollment_flow.uuid
  stage                = authentik_stage_prompt.teamstash_unenrollment_prompt.id
  order                = 0
  re_evaluate_policies = true
  evaluate_on_plan     = false
}

resource "authentik_flow_stage_binding" "teamstash_unenrollment_user_delete" {
  target               = authentik_flow.teamstash_unenrollment_flow.uuid
  stage                = authentik_stage_user_delete.teamstash_unenrollment_user_delete.id
  order                = 10
  re_evaluate_policies = true
  evaluate_on_plan     = false
}
