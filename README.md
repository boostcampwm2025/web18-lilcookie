# Team Stash

[홈페이지](https://docs.teamstash.eupthere.uk)

[대시보드](https://app.teamstash.eupthere.uk)

Teamstash는 팀의 북마크를 한 곳에 모으고, 각종 협업 도구에 연결하는 저장소입니다. Webhook 알림, OAuth2.0 자원 인가, OIDC1.0 인증을 지원합니다. n8n에 연결하여 워크플로우를 구성할 수 있습니다.

https://github.com/user-attachments/assets/c3df09bc-d69c-4263-80c4-af6e89b5e62d

### **📖 프로젝트 소개**

**문제 정의**: 팀에 공유한 지식이 휘발된다. Slack 메시지에 묻혀 다시 찾기 어려운 정보, 여러 협업 도구에 파편화 되어 저장되는 자료들.

**핵심 기능**: 북마크를 쉽게 한 곳에 모은다. 모은 자료를 다양한 협업 워크플로우로 활용한다.

**초기 프로토타입 MVP**: 3번의 클릭으로 팀 저장소에 북마크를 저장할 수 있는 크롬 확장 프로그램.

**프로토타입 사용자 테스트 결과**: 자료를 쉽게 모으는 것에는 성공했지만, 어떻게 활용할 지에 대한 기획 확장이 필요하다는 인사이트 얻음. 각 팀마다 자료를 구조화 하고 활용하는 방식이 다르다는 것 발견. 

**기획 확장 요구사항**: 
- 표준화된 방식으로 외부 서비스에 연결할 수 있다 (OAuth, OIDC).
- n8n으로 워크플로우를 구성할 수 있다.
- 외부 개발자가 3rd party 플러그인을 만들어 teamstash 저장소에 연결할 수 있다.
- 팀 자원의 접근 권한을 설정하고 보호할 수 있다.

## 시작하기

### 개발 환경 구성

#### 요구사항
- Node.js 22
- Docker
- Terraform Client

```shell
pnpm i
# 환경 변수 파일 작성
# apps/backend/.env.sample
# infra/terraform/secret.auto.tfvars
# infra/docker/.env.development.local
pnpm --filter backend prisma:generate
pnpm run docker:dev:up
# https://auth.localhost Authentik 서버 초기화 완료 확인
cd ./infra/terraform
terraform init
terraform apply
cd ../..
pnpm dev
```

[Windows OS localhost hostname 설정](https://github.com/boostcampwm2025/web18-lilcookie/issues/142)

### 배포 인프라 아키텍처

<img width="1152" height="738" alt="image" src="https://github.com/user-attachments/assets/3b5cb844-36fe-48bf-bd48-3a88092d5043" />

### 팀소개

> lil cookie🍪 - 쿠키는 맛있는 데이터 조각입니다. 우리의 쿠키가 사용자에게 즐거운 시간을 주었으면 좋겠습니다.

| J123\_박준호                                                    | J193\_이수진                                                     | J204\_이윤표                                                    | J243\_정아현                                                    |
| --------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- |
| ![박준호](https://avatars.githubusercontent.com/u/32813311?v=4) | ![이수진](https://avatars.githubusercontent.com/u/182627132?v=4) | ![이윤표](https://avatars.githubusercontent.com/u/30365108?v=4) | ![정아현](https://avatars.githubusercontent.com/u/97656991?v=4) |


### 개발 서버 실행 방법

## 개발용 인프라 Docker Compose

`./infra/docker/.env.development.local` 작성

`pnpm run docker:dev:up`
`pnpm run docker:dev:down`
`pnpm run docker:dev:logs`

## Terraform

1. [Terraform 설치](https://developer.hashicorp.com/terraform/install)
2. 개발용 인프라 정상 동작 확인 (https://auth.localhost 연결 시 Authentik 정상 표시되는지 확인)
3. `cd infra/terraform`
4. `terraform init` : terraform 초기화
5. `terraform plan` : 어떤 작업을 실행할 것인지 미리 확인
6. `terraform apply` : 작업 반영 (yes 타이핑 필요)

## Frontend, backend

개발 과정에서 HMR을 위해 docker compose에 포함하지 않음.

1. 프로젝트 루트에서 `pnpm run start:dev`
2. 백엔드: 브라우저에서 `https://api.localhost/health` 접속 시도
3. 프론트엔드: 브라우저에서 `https://app.localhost` 접속 시도

## 개발 환경 TLS 인증서

### 윈도우10 기준 인증서 세팅법:
`web18-lilcookie\infra\caddy\data\caddy\pki\authorities\local\root.crt` 우클릭 -> 인증서 설치 -> 저장소 위치(로컬 컴퓨터) -> 모든 인증서를 다음 위치에 저장 -> 찾아보기 -> 신뢰할 수 있는 루트 기관 -> 다음다음 -> END

### MacOS 기반 인증서 세팅 방법
`web18-lilcookie/infra/caddy/data/caddy/pki/authorities/local/root.crt` 더블 클릭 → Keychain Access에 인증서 설치된 것 확인 (관리자 인증) → Caddy Local Authority 우클릭 → get info → Trust → When using this certificate: Always Trust (관리자 인증)