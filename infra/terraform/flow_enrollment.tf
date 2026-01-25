
resource "authentik_flow" "teamstash_enrollment_flow" {
  name        = "TeamStash Enrollment Flow"
  title       = "Sign Up"
  slug        = "teamstash-enrollment-flow"
  designation = "enrollment"
}

resource "authentik_flow_stage_binding" "teamstash_enrollment_prompt_binding" {
  target = authentik_flow.teamstash_enrollment_flow.uuid
  stage  = authentik_stage_prompt.teamstash_enrollment_prompt.id
  order  = 10
}

