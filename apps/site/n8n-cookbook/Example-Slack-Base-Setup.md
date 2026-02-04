# 🛠️ [Lv.0] 공통: 슬랙 봇 생성 및 n8n 연결 가이드

> [!IMPORTANT]
> 이 문서는 이어지는 활용 예제(Lv.1~3)를 실행하기 위한 **가장 기초적인 단계**입니다.
>
> 슬랙 애플리케이션을 생성하고 n8n과 연동하는 과정을 차근차근 따라와 주세요.

---

## 1. 슬랙 애플리케이션(App) 생성

![slack1](https://github.com/user-attachments/assets/caf66e95-5d30-4843-bb93-ecdcc17cb994)

먼저 내 워크스페이스에서 활동할 봇의 본체를 만들어야 합니다.

1. **[Slack API 대시보드](https://api.slack.com/apps)** 에 접속합니다.
2. **`Create New App`** 버튼을 클릭한 후, **`From scratch`** 를 선택합니다.
3. **App Name**을 입력(예: `Lilcookie Bot`)하고, 연동할 **Development Slack Workspace**를 선택한 뒤 `Create App`을 누릅니다.

---

## 2. 권한(Scopes) 설정

![slack2](https://github.com/user-attachments/assets/afcd5a25-f684-4e15-9511-b6ab9d16563e)

봇이 메시지를 보내고, 명령어를 수신하기 위한 권한을 부여해야 합니다.

1. 왼쪽 사이드바 메뉴에서 **`OAuth & Permissions`** 로 이동합니다.
2. 하단의 **`Scopes`** 섹션 중 **`Bot Token Scopes`** 항목에서 아래의 권한들을 추가(`Add an OAuth Scope`)합니다.

- `chat:write`: 봇이 채널에 메시지를 보낼 수 있습니다.
- `commands`: `/save`, `/search` 등의 슬래시 명령어를 수신합니다.

---

## 3. 워크스페이스에 앱 설치 및 토큰 발급

![slack3](https://github.com/user-attachments/assets/aba8593b-0733-40dd-89d4-6a29c936a1e2)

1. 같은 페이지 상단으로 올라가 **`Install to Workspace`** 버튼을 클릭합니다.
2. 권한 요청 화면에서 **`허용(Allow)`** 을 누릅니다.
3. 설치가 완료되면 **`Bot User OAuth Token`** (주로 `xoxb-`로 시작)이 생성됩니다. 이 값을 복사하여 안전한 곳에 보관하세요. **(n8n 연결 시 필수!)**

---

## 4. n8n에 Slack Credential 등록

![slack4](https://github.com/user-attachments/assets/73c1b292-909e-49bf-9c35-8e2b0daa90bd)

이제 n8n이 방금 만든 슬랙 봇을 조종할 수 있도록 연결 정보를 등록합니다.

1. 본인의 **n8n 대시보드**에 접속합니다.
2. 왼쪽 메뉴의 **`Credentials`** > 오른쪽 상단 **`Add Credential`** 을 클릭합니다.
3. 검색창에 **`Slack API`** 를 입력하고 선택한 뒤 `Continue`를 누릅니다.
4. 아래와 같이 정보를 입력합니다.

- **Authentication**: `Access Token` 선택
- **Access Token**: 위 3번 단계에서 복사한 **`xoxb-`로 시작하는 토큰**을 붙여넣습니다.

5. **`Save`** 를 눌러 저장합니다. `Connection tested successfully`라는 초록색 메시지가 뜨면 성공입니다!

---

## 5. 슬랙 채널에 봇 초대하기

![slack5](https://github.com/user-attachments/assets/75c101fe-c448-4190-a522-c1e84d4c993e)

봇이 메시지를 보내거나 읽으려면 해당 채널에 들어와 있어야 합니다.

1. 연동할 슬랙 채널로 이동합니다.
2. 채널 입력창에 `/invite @봇이름` (예: `@Lilcookie Bot`)을 입력하여 봇을 초대합니다.

---

### ✅ 준비 완료!

이제 기반 설정이 모두 끝났습니다. 이제 아래 예제 중 원하는 워크플로우를 골라 진행해 보세요!

- **[🔔 [Lv.1] 링크 저장 시 슬랙 & 메일 실시간 알림](./Example-Notification)**
- **[🤖 [Lv.2] 슬랙 슬래시 명령어로 상세 저장 봇 만들기](./Example-Slack-Save-Bot)**

---

### 💡 다음 단계 팁

- **Lv.1**은 우리 서비스의 **Webhook** 기능을 테스트하는 데 최적화되어 있습니다.
- **Lv.2**는 슬랙 앱 설정의 `Interactivity` 메뉴를 추가로 사용하게 됩니다. 각 문서에서 상세히 안내해 드릴게요.
