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
plan = request.context.get("flow_plan")
if not plan:
    return False

# post_logout_redirect_uri is nested inside "query" param as a query string
query_string = request.http_request.GET.get("query")
if not query_string:
    return False

# Extract post_logout_redirect_uri from the query string
post_logout_param = None
for param in query_string.split("&"):
    if param.startswith("post_logout_redirect_uri="):
        post_logout_param = param
        break

if not post_logout_param:
    return False

# Remove "post_logout_redirect_uri=" prefix
uri = post_logout_param.split("=", 1)[1] if "=" in post_logout_param else None
if not uri:
    return False

# URL decode (applied twice - once for query encoding, once for the URI itself)
uri = regex_replace(uri, "%25", "%PERCENT_TEMP%")
uri = regex_replace(uri, "%3A", ":")
uri = regex_replace(uri, "%2F", "/")
uri = regex_replace(uri, "%3F", "?")
uri = regex_replace(uri, "%3D", "=")
uri = regex_replace(uri, "%26", "&")
uri = regex_replace(uri, "%PERCENT_TEMP%", "%")
# Second pass for double-encoded values
uri = regex_replace(uri, "%3A", ":")
uri = regex_replace(uri, "%2F", "/")
uri = regex_replace(uri, "%3F", "?")
uri = regex_replace(uri, "%3D", "=")
uri = regex_replace(uri, "%26", "&")

allowed_hosts = ${jsonencode(var.post_logout_allowed_hosts)}

# Reject javascript: and data: schemes
if regex_match(uri, "^(javascript|data|vbscript):"):
    return False

# Check if absolute URL (has scheme)
if regex_match(uri, "^https?://"):
    host = regex_replace(uri, "^https?://([^/:]+).*", r"\1")
    if host not in allowed_hosts:
        return False
elif regex_match(uri, "^//"):
    host = regex_replace(uri, "^//([^/:]+).*", r"\1")
    if host not in allowed_hosts:
        return False

plan.redirect(uri)
return False
PY
}

resource "authentik_policy_binding" "post_logout_policy_binding" {
  target = authentik_flow_stage_binding.post_logout_redirect_binding.id
  policy = authentik_policy_expression.post_logout_redirect_policy.id
  order  = 0
}
