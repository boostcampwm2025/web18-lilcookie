# --- TeamStash Password Change Flow ---

resource "authentik_flow" "teamstash_password_change" {
  name           = "TeamStash Password Change"
  title          = "Change password"
  slug           = "teamstash-password-change"
  designation    = "stage_configuration"
  authentication = "require_authenticated"
}

# --- Stage Bindings ---

resource "authentik_flow_stage_binding" "password_change_prompt" {
  target               = authentik_flow.teamstash_password_change.uuid
  stage                = authentik_stage_prompt.teamstash_password_change_prompt.id
  order                = 0
  re_evaluate_policies = true
  evaluate_on_plan = false
}

resource "authentik_flow_stage_binding" "password_change_write" {
  target               = authentik_flow.teamstash_password_change.uuid
  stage                = authentik_stage_user_write.teamstash_password_change_write.id
  order                = 1
  re_evaluate_policies = true
  evaluate_on_plan = false
}
