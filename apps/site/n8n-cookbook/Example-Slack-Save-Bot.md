# 🤖 [Lv.2] 슬랙 슬래시 명령어로 상세 저장 봇 만들기

> [!IMPORTANT]
> 이 가이드에서는 슬랙에서 `/save` 명령어를 입력했을 때 **'로딩 중' 화면을 먼저 보여주고**, 백엔드에서 팀/폴더 정보를 모두 가져온 뒤 **입력 폼으로 업데이트**하는 UX 패턴을 다룹니다.
>
> **⚠️ 경고: 높은 난이도**
>
> - **비동기 UI 업데이트**: 슬랙의 `views.open`과 `views.update`를 연계하여 타임아웃을 방지하는 기술이 사용됩니다.
> - **복합 데이터 처리**: 팀 리스트와 각 팀의 폴더 리스트를 조회하고 병합(`Merge`)하는 로직이 포함됩니다.
> - **참고 문서**: [Slack 공식 문서: Handling user interactions (3s timeout)](https://docs.slack.dev/interactivity/handling-user-interaction/)
> - **도구**: [Slack Block Kit Builder](https://app.slack.com/block-kit-builder) (모달 디자인 필수 도구)

---

## 1. n8n 워크플로우 구성

<img width="834" height="377" alt="image" src="https://github.com/user-attachments/assets/32a9d1c1-5299-454f-a973-22bb29c7fe30" />

전체 워크플로우는 슬랙의 **'3초 타임아웃(3s Timeout)'** 제한을 우회하고 데이터를 안정적으로 처리하기 위해 설계되었습니다.

- **Phase A (초기화 및 뷰 로딩)**:

1. `/save` 수신 즉시 `200 OK` 응답 (연결 유지)
2. **"로딩 중..."** 모달을 우선 표시 (`views.open`)
3. 백엔드에서 팀/폴더 목록을 비동기로 조회 및 병합
4. 로딩 모달을 **"실제 입력 폼"** 으로 교체 (`views.update`)

- **Phase B (데이터 저장 및 피드백)**:

1. 모달 '제출' 수신 즉시 `200 OK` 응답
2. 데이터 가공 및 백엔드 저장 API 호출
3. `success` 필드 값에 따라 **성공(전체 알림)** / **실패(개인 알림)** 분기 처리

---

## 2. 상세 설정 단계

### **Step 1: 슬랙 앱 설정 (Slash Command & Interactivity)**

![qq1](https://github.com/user-attachments/assets/849d018c-394a-4b18-bcc9-d81c52b03b40)

슬랙 API 설정 페이지에서 n8n과 대화할 수 있는 두 개의 통로를 엽니다.

1. **Slash Command 등록**:
   - **Command**: `/save`
   - **Request URL**: Phase A의 시작점인 **`save` Webhook 노드** URL을 입력합니다.

2. **Interactivity 설정**:
   - **Request URL**: Phase B의 시작점인 **`Interactivity` Webhook 노드** URL을 입력합니다.

---

### **Step 2: 타임아웃 방지를 위한 '선응답' 및 '로딩 뷰' 전략**

<img width="524" height="243" alt="image" src="https://github.com/user-attachments/assets/4d46e1f2-9d19-4288-a987-984734fa7ccc" />

슬랙은 3초 내에 응답이 없으면 에러를 발생시킵니다. 백엔드 API 통신은 3초를 넘길 수 있으므로, **일단 화면을 띄워두고 나중에 내용을 채우는 전략**을 사용합니다.

1. **Respond to Webhook Node (`수신 응답 (200 ok)4`)**:
   - `save` 웹훅이 들어오자마자 연결하여 슬랙에게 `200 OK`를 보냅니다. 이제 n8n은 백그라운드에서 계속 작업할 수 있습니다.

2. **Code Node (`설정 로딩 뷰 준비`)**:
   - 사용자에게 보여줄 임시 "로딩 중..." 메시지가 담긴 블록(Block)을 정의합니다.

3. **HTTP Request Node (`설정 로딩 뷰 띄우기`)**:
   - 슬랙 API `views.open`을 호출하여 로딩 모달을 띄웁니다. 이때 반환되는 **`view_id`** 는 나중에 화면을 교체할 때 필수적이므로 잘 챙겨둡니다.

---

### **Step 3: 데이터 병합 루프 및 뷰 업데이트 (핵심 로직)**

<img width="525" height="573" alt="image" src="https://github.com/user-attachments/assets/58d22a80-9573-4a62-bb43-91b5cd5df7d0" />

사용자가 선택할 팀과 폴더 목록을 만들기 위해 데이터를 조회하고 구조화합니다.

1. **HTTP Request Node (`백엔드 팀 조회 API`)**: 전체 팀 리스트를 가져옵니다.
2. **Loop Logic (`팀 리스트 분할` -> `팀 반복`)**:
   - 가져온 팀 개수만큼 반복문을 실행합니다.
   - **HTTP Request (`백엔드 폴더 조회 API`)**: 현재 순서의 `teamUuid`를 사용해 해당 팀의 폴더 목록을 가져옵니다.
   - **Set Node (`팀 폴더 매핑`)**: 팀 정보와 폴더 정보를 하나의 객체(`{ team: ..., folders: ... }`)로 합칩니다.

3. **Code Node (`저장 뷰 구성`)**:
   - 반복문이 끝나고 모인 모든 데이터를 이용해 슬랙의 **Static Select(옵션 그룹)** 형태의 JSON을 생성합니다.
   - 이전 단계에서 받은 `view_id`를 참조하여 업데이트 대상을 지정합니다.

4. **HTTP Request Node (`저장 뷰 띄우기`)**:
   - 슬랙 API `views.update`를 호출합니다. 사용자가 보고 있던 "로딩 중" 화면을 **"팀/폴더 선택 폼"** 으로 업데이트합니다.

---

### **Step 4: 제출 데이터 가공 및 API 저장 요청**

<img width="412" height="577" alt="image" src="https://github.com/user-attachments/assets/b333eb0f-449c-4499-a526-6a879081e08e" />

사용자가 폼을 다 채우고 '저장'을 눌렀을 때의 처리 과정입니다.

1. **Webhook & Respond Node (`Interactivity` -> `수신 응답`)**:
   - 버튼 클릭도 인터랙션이므로, 다시 한번 즉시 `200 OK`를 보내 에러 창을 막습니다.

2. **Code Node (`저장 데이터 가공`)**:
   - 슬랙 Payload(`view.state.values`)를 파싱하여 `title`, `url`, `summary`, `tags` 등을 추출합니다.
   - `private_metadata`에 숨겨둔 원본 `url`과 `channelId`를 복원합니다.

3. **HTTP Request Node (`백엔드 링크 추가 API`)**:
   - 정제된 데이터를 백엔드 서버(`POST /links`)로 전송합니다. 이때 `onError: continue` 설정을 통해 에러가 나도 워크플로우가 멈추지 않게 합니다.

---

### **Step 5: 성공 여부에 따른분기 처리**

API 호출이 끝났다고 성공한 것이 아닙니다. 백엔드가 보내준 응답을 검증해야 합니다.

1. **If Node (`링크 추가 성공 ?`)**:
   - API 응답 JSON 내의 **`success`** 필드가 `true`인지 확인합니다.

2. **True (성공 시)**:
   - **Code Node (`성공 메세지 준비`)**: `✅ <@user>님이 링크를 저장했습니다!` 형태의 메시지를 구성합니다.
   - **HTTP Request (`링크 저장 완료 메세지 전송`)**: `chat.postMessage`로 채널에 공개 알림을 보냅니다.

3. **False (실패 시)**:
   - **Code Node (`실패 메세지 준비`)**: 백엔드에서 반환한 `message` (에러 사유)를 포함하여 경고 메시지를 구성합니다.
   - **HTTP Request (`링크 저장 실패 메세지 전송`)**: `chat.postEphemeral` API를 사용하여 **해당 유저에게만 보이는** 에러 메시지를 보냅니다.

---

## 3. 핵심 기술 포인트 (Tip)

- **View ID의 생명 주기**: `views.open`으로 생성된 `view_id`는 모달을 식별하는 유일한 키입니다. `views.update`를 할 때 이 ID가 틀리면 에러가 발생하므로 데이터 흐름에 주의하세요.
- **Private Metadata 활용**: 모달은 여러 단계로 업데이트되지만, 처음에 `/save` 명령어를 쳤던 **채널 ID**나 **원본 텍스트**는 계속 유지되어야 합니다. 이를 `private_metadata` 필드에 JSON 문자열로 넣어 계속 넘겨주는 것이 핵심입니다.
- **사용자 경험(UX)**: 데이터 로딩이 1초라도 걸린다면 '로딩 뷰'를 먼저 보여주는 것이 좋습니다. 그렇지 않으면 사용자는 "버튼을 눌렀는데 왜 반응이 없지?"라고 생각하게 됩니다.

---

## 4. 결과 예시

<img width="445" height="172" alt="image" src="https://github.com/user-attachments/assets/4f26b29d-09b5-4288-86c7-db5f232ad120" />

- **성공 시**: 채널에 저장된 링크 정보가 공유됩니다.

<img width="537" height="171" alt="image" src="https://github.com/user-attachments/assets/3daa473c-a252-4415-bad7-857d9d62fa63" />

- **실패 시**: "죄송합니다, 링크 저장 중 문제가 발생했습니다. (사유: 중복된 URL)"과 같은 메시지가 **나에게만** 표시됩니다.

## 📚 데이터 구조 참고

사용할 수 있는 API에 대한 정보는 아래 레퍼런스를 확인하세요.

👉 [API Reference](https://github.com/boostcampwm2025/web18-lilcookie/wiki/API-Reference)

## 구성된 n8n 워크플로우 파일

- [Exam_SaveBot_n8n.json](https://github.com/user-attachments/files/25025928/Exam_SaveBot_n8n.json)
- 위 링크를 클릭하여 워크플로우 JSON 파일을 다운로드한 후, n8n에서 가져오기(import)하여 사용하세요.
