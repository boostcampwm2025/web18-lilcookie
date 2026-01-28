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
