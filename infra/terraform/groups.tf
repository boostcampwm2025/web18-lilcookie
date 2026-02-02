# All Authentik Group resources

resource "authentik_group" "teamstash_group" {
  name         = "Teamstash Group"
  users        = []
  is_superuser = false
}
