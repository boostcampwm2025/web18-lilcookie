# Authentik Post-Logout Redirect Flow
# Drop this file into your Terraform stack and import resources as needed.

# 1) Invalidation Flow
resource "authentik_flow" "post_logout_redirect" {
  name        = "Post Logout Redirect Flow"
  slug        = "post-logout-redirect"
  title       = "Post Logout Redirect"
  designation = "invalidation"
}

# 2) User Logout Stage
resource "authentik_stage_user_logout" "post_logout_logout_stage" {
  name = "post-logout-user-logout-stage"
}

resource "authentik_flow_stage_binding" "post_logout_logout_binding" {
  target               = authentik_flow.post_logout_redirect.uuid
  stage                = authentik_stage_user_logout.post_logout_logout_stage.id
  order                = 0
  evaluate_on_plan     = false
  re_evaluate_policies = true
}

# 3) Dummy Redirect Stage (actual redirect handled by policy)
resource "authentik_stage_redirect" "post_logout_dummy_redirect" {
  name          = "post-logout-dummy-redirect"
  mode          = "static"
  target_static = "about:blank"
}

resource "authentik_flow_stage_binding" "post_logout_redirect_binding" {
  target               = authentik_flow.post_logout_redirect.uuid
  stage                = authentik_stage_redirect.post_logout_dummy_redirect.id
  order                = 10
  evaluate_on_plan     = false
  re_evaluate_policies = true
}

# 4) Expression Policy performing dynamic redirect
resource "authentik_policy_expression" "post_logout_redirect_policy" {
  name       = "post-logout-redirect-policy"
  expression = <<-PY
# Adapted from https://docs.goauthentik.io/add-secure-apps/flows-stages/flow/examples/snippets/#redirect-current-flow-to-another-url
plan = request.context.get("flow_plan")
if not plan:
    return False
# `request.http_request` is a Django HTTPRequest object, see https://docs.goauthentik.io/customize/policies/expression/#variables
query_params = request.http_request.GET.get("query")  # this is a long string
post_logout_redirect_uri = next(filter(lambda s: s.startswith("post_logout_redirect_uri"), query_params.split("&")))  # this looks like "post_logout_redirect_uri=..."
post_logout_redirect_uri = post_logout_redirect_uri.split("=")[1]  # remove "post_logout_redirect_uri=" prefix
post_logout_redirect_uri = post_logout_redirect_uri.replace("%3A", ":").replace("%2F", "/")  # Authentik won't perform redirect properly unless we present non-URL-encoded URI to plan.redirect() in the next line.
plan.redirect(post_logout_redirect_uri)
return False
PY
}

resource "authentik_policy_binding" "post_logout_policy_binding" {
  target = authentik_flow_stage_binding.post_logout_redirect_binding.id
  policy = authentik_policy_expression.post_logout_redirect_policy.id
  order  = 0
}
