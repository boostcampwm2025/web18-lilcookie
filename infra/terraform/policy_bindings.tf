# All Authentik Policy Binding resources

resource "authentik_policy_binding" "post_logout_policy_binding" {
  target = authentik_flow_stage_binding.post_logout_redirect_binding.id
  policy = authentik_policy_expression.post_logout_redirect_policy.id
  order  = 0
}
