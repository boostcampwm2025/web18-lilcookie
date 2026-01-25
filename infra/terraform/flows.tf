# All Authentik Flow resources

# --- Enrollment Flow ---
resource "authentik_flow" "teamstash_enrollment_flow" {
  name        = "TeamStash Enrollment Flow"
  title       = "Sign Up"
  slug        = "teamstash-enrollment-flow"
  designation = "enrollment"
}

# --- Post-Logout Redirect Flow ---
resource "authentik_flow" "post_logout_redirect" {
  name        = "Post Logout Redirect Flow"
  slug        = "post-logout-redirect"
  title       = "Post Logout Redirect"
  designation = "invalidation"
}
