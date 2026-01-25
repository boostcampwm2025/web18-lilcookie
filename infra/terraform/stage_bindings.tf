# All Authentik Flow Stage Binding resources

# --- Post-Logout Flow Bindings ---
resource "authentik_flow_stage_binding" "post_logout_logout_binding" {
  target               = authentik_flow.post_logout_redirect.uuid
  stage                = authentik_stage_user_logout.post_logout_logout_stage.id
  order                = 0
  evaluate_on_plan     = false
  re_evaluate_policies = true
}

resource "authentik_flow_stage_binding" "post_logout_redirect_binding" {
  target               = authentik_flow.post_logout_redirect.uuid
  stage                = authentik_stage_redirect.post_logout_dummy_redirect.id
  order                = 10
  evaluate_on_plan     = false
  re_evaluate_policies = true
}
