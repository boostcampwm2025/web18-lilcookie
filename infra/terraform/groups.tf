# All Authentik Group resources

resource "authentik_group" "teamstash_group" {
  name         = "Teamstash Group"
  is_superuser = false
  lifecycle {
    ignore_changes = [users]
  }
}
