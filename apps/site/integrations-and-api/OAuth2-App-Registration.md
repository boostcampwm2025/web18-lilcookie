# 🚀 연동 시작하기: OAuth2 앱 발급

우리 서비스를 외부 앱(n8n)과 연결하려면 먼저 우리 사이트에서 **OAuth2 애플리케이션**을 등록해야 합니다.

> [!IMPORTANT]
>
> 이 문서는 n8n 사용자를 위한 가이드입니다.
>
> 다른 플랫폼을 사용하는 경우, 해당 플랫폼의 OAuth2 설정 방법을 참고하세요.

---

## 1. n8n에서 Redirect URL 복사하기 (준비물)

![ex1](https://github.com/user-attachments/assets/d4e26163-a283-41b8-82d9-343140216428)

우리 서비스에 앱을 등록할 때 n8n의 주소를 알려줘야 합니다.

1. **n8n 접속** -> 왼쪽 메뉴의 **"+" 버튼** -> **Credentials**를 클릭합니다.
2. `Add Credential` 버튼을 누르고 **OAuth2 API**를 검색하여 선택합니다.
3. 설정창에 있는 **OAuth Redirect URL** 항목의 주소를 복사합니다.

- 예시: `https://your-n8n-domain.com/rest/oauth2-callback`

---

## 2. 우리 서비스에서 앱 등록하기

![ex2](https://github.com/user-attachments/assets/be09ce56-4b3a-4f04-8fdc-4125975d5ad0)

이제 복사한 주소를 들고 우리 서비스의 OAuth 연결 센터로 이동합니다.

1. **[메인 페이지] > [OAuth 연결]** 버튼으로 진입합니다.
   - 혹은 직접 **[OAuth 연결 센터](https://app.teamstash.eupthere.uk/oauth-apps)** 로 이동합니다.
2. `+ 새 앱 만들기` 버튼을 클릭합니다.
3. 아래 정보를 입력합니다.

- **앱 이름**: n8n 연동용 (자유롭게 입력)
- **Redirect URI**: 위 1번 단계에서 n8n으로부터 복사한 주소를 붙여넣습니다. **(가장 중요!)**

4. `앱 생성`버튼으로 등록을 완료하면 화면에 나타나는 **Client ID**와 **Client Secret**을 안전한 곳에 복사해둡니다.
   - **주의**: `Client Secret`은 이 화면에서만 확인할 수 있습니다. 분실 시 앱을 삭제하고 다시 만들어야 합니다.

---

## 3. 인증 정보(Credentials) 요약

n8n 설정 시 필요한 **우리 서비스의 인증 정보**입니다.

| 구분                  | 값 (Endpoint)                                                |
| --------------------- | ------------------------------------------------------------ |
| **Authorization URL** | `https://auth.teamstash.eupthere.uk/application/o/authorize/` |
| **Token URL**         | `https://auth.teamstash.eupthere.uk/application/o/token/`     |
| **Client ID**         | (위 2단계에서 발급받은 Client ID 입력)                       |
| **Client Secret**     | (위 2단계에서 발급받은 Client Secret 입력)                   |

> [!WARNING]
>
> `Client Secret`은 한 번만 노출되거나 타인에게 절대 공유해서는 안 됩니다. 만약 유출되었다면 즉시 앱을 삭제하고 재발급받으세요.

---

## 4. 다음 단계

이제 발급받은 Client ID와 Client Secret을 가지고 n8n에서 크레덴셜을 등록할 차례입니다.

👉 **[🔗 n8n 크레덴셜 등록 가이드](https://github.com/boostcampwm2025/web18-lilcookie/wiki/n8n-Integration-Guide)** 로 이동하여 설정을 마무리하세요.

감사합니다! 문제가 발생하면 언제든지 지원팀에 문의해 주세요.
