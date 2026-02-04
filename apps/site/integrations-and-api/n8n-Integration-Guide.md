# 🔗 n8n 크레덴셜 등록 가이드

이 가이드는 우리 서비스에서 발급받은 OAuth2 인증 정보를 n8n에 등록하여 API를 사용할 수 있는 상태로 만드는 과정을 설명합니다.

단계별로 따라오시면 쉽게 설정할 수 있습니다!

---

## 1. OAuth2 API 크레덴셜 생성

![ex1](https://github.com/user-attachments/assets/b6853aa6-1800-4a5d-9457-fad1c2347c21)

1. n8n 대시보드 왼쪽 메뉴에서 **Credentials**를 클릭합니다.
2. 오른쪽 상단의 **Add Credential** 버튼을 누릅니다.
3. 검색창에 **OAuth2 API**를 입력하고 선택한 뒤 **Continue**를 클릭합니다.

---

## 2. 인증 상세 정보 입력

![ex3](https://github.com/user-attachments/assets/d2b9fe10-d15d-4c9f-a8b9-79fd08dd1003)

우리 서비스의 개발자 센터에서 발급받은 정보와 아래의 엔드포인트 주소들을 각각의 칸에 정확히 입력하세요.

| n8n 필드명            | 입력해야 할 값                                                |
| --------------------- | ------------------------------------------------------------- |
| **Authentication**    | `Header` (기본값)                                             |
| **Authorization URL** | `https://auth.teamstash.eupthere.uk/application/o/authorize/` |
| **Access Token URL**  | `https://auth.teamstash.eupthere.uk/application/o/token/`     |
| **Client ID**         | 우리 서비스에서 발급받은 **Client ID**                        |
| **Client Secret**     | 우리 서비스에서 발급받은 **Client Secret**                    |
| **이외 필드들**       | 기본값으로 설정                                               |

---

## 3. 권한 승인 및 연결 테스트

정보 입력이 끝났다면 실제 우리 서비스 계정과 연결을 시도합니다.

1. 설정창 하단의 **Connect my account** (또는 'Sign in with OAuth2') 버튼을 클릭합니다.
2. 우리 서비스의 로그인이 수행되고, 연결 성공 팝업을 확인합니다.
3. n8n 설정창의 연결 상태가 `Connection tested successfully` 또는 `Authorized`로 변경되었는지 확인합니다.
4. 오른쪽 상단의 **Save**를 눌러 저장합니다.

---

## 4. 트러블슈팅 (자주 묻는 질문)

- **Q. "Invalid Redirect URI" 에러가 발생해요.**
- **A**: 우리 서비스의 개발자 센터에 등록한 `Redirect URI`와 n8n 설정창 하단에 적힌 주소가 완전히 일치하는지 확인하세요. (대소문자 및 마지막 슬래시 유무 확인)

- **Q. 승인 버튼을 눌렀는데 n8n으로 돌아오지 않아요.**
- **A**: 브라우저의 팝업 차단 기능이 활성화되어 있는지 확인해 주세요.

---

## 5. 다음 단계

연동에 성공하셨나요? 이제 실제 데이터를 주고받을 수 있는 API 목록을 확인해 보세요!

👉 **[📚 API Reference](https://github.com/boostcampwm2025/web18-lilcookie/wiki/API-Reference)** 로 이동하기

감사합니다! 문제가 발생하면 언제든지 지원팀에 문의해 주세요.
