import { DocumentBuilder } from "@nestjs/swagger";

export function createSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle("Team Stash API")
    .setDescription("팀의 링크를 모으고 요약하는 브라우저 확장 프로그램의 백엔드 API")
    .setVersion("1.0.0")
    .addServer("https://api.localhost", "개발 서버")
    .addTag("folders", "폴더 관리")
    .addTag("links", "링크 관리")
    .addTag("teams", "팀 관리")
    .build();
}
