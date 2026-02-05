# All Authentik Policy resources

# --- Password Policies ---
resource "authentik_policy_password" "teamstash_password_policy" {
  name                    = "TeamStash Password Policy"
  length_min              = 8
  amount_uppercase        = 1
  amount_symbols          = 1
  amount_digits           = 1
  error_message           = "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 symbol, and 1 digit."
  check_have_i_been_pwned = true
  check_zxcvbn            = true
  zxcvbn_score_threshold  = 2
}

# --- Expression Policies ---

resource "authentik_policy_expression" "teamstash_username_from_email" {
  name       = "teamstash-username-from-email"
  expression = <<-PY
request.context['prompt_data']['username'] = request.context['prompt_data']['email']
return True
PY
}

resource "authentik_policy_expression" "teamstash_authentication_password_stage" {
  name       = "teamstash-authentication-flow-password-stage"
  expression = <<-PY
flow_plan = request.context.get("flow_plan")
if not flow_plan:
    return True
# If the user does not have a backend attached to it, they haven't
# been authenticated yet and we need the password stage
return not hasattr(flow_plan.context.get("pending_user"), "backend")
PY
}

resource "authentik_policy_expression" "teamstash_authentication_mfa_validation_stage" {
  name       = "teamstash-authentication-flow-authenticator-validate-stage"
  expression = <<-PY
flow_plan = request.context.get("flow_plan")
if not flow_plan:
    return True
# if the authentication method is webauthn (passwordless), then we skip the authenticator
# validation stage by returning false (true will execute the stage)
return not (flow_plan.context.get("auth_method") == "auth_webauthn_pwl")
PY
}

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
