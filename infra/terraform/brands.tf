resource "authentik_brand" "teamstash_brand" {
  domain                           = var.authentik_domain
  default                          = false
  branding_title                   = "TeamStash"
  branding_default_flow_background = "teamstash-login-background.png"
  branding_logo                    = "teamstash-logo.svg"
  branding_favicon                 = "teamstash-favicon.png"
  branding_custom_css              = <<-EOF
/* Hide 'Powered by authentik' */
.pf-c-login__footer {display: none}
  EOF
}

