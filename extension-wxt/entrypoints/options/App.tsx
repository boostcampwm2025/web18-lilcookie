import { useState, useEffect } from "react";
import "./App.css";

// 팀 ID 목록
const TEAM_OPTIONS = [
  ...Array.from(
    { length: 30 },
    (_, i) => `web${String(i + 1).padStart(2, "0")}`
  ),
  "and01",
  "and02",
  "and03",
  "ios01",
  "ios02",
  "ios03",
  "ios04",
  "ios05",
];

function App() {
  const [camperId, setCamperId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [aiPassword, setAiPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 페이지 로드 시 저장된 설정 불러오기
  useEffect(() => {
    chrome.storage.sync.get(
      { camperId: "", teamId: "", aiPassword: "" },
      (items: any) => {
        if (chrome.runtime.lastError) {
          return;
        }
        setCamperId(items.camperId || "");
        setTeamId(items.teamId || "");
        setAiPassword(items.aiPassword || "");
      }
    );
  }, []);

  // 설정 저장
  const handleSave = () => {
    setIsSaving(true);

    chrome.storage.sync.set({ camperId, teamId, aiPassword }, () => {
      if (chrome.runtime.lastError) {
        setStatus("저장 실패: " + chrome.runtime.lastError.message);
        setIsSaving(false);
        return;
      }

      setStatus("설정이 저장되었습니다.");

      // 저장 후 다시 읽어서 확인
      chrome.storage.sync.get(
        ["camperId", "teamId", "aiPassword"],
        (items: any) => {}
      );

      setTimeout(() => {
        setStatus("");
        setIsSaving(false);
      }, 1000);
    });
  };

  return (
    <div className="container">
      <h1>확장프로그램 설정 페이지</h1>

      <div className="form-group">
        <label htmlFor="camperId">나의 캠퍼 ID</label>
        <input
          type="text"
          id="camperId"
          placeholder="J001, K001, S001 형식"
          value={camperId}
          onChange={(e) => setCamperId(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="teamId">나의 팀 ID</label>
        <select
          id="teamId"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
        >
          <option value="" disabled>
            목록에서 선택하세요
          </option>
          {TEAM_OPTIONS.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="aiPassword">AI 비밀번호</label>
        <input
          type="password"
          id="aiPassword"
          placeholder="비밀번호를 입력하세요"
          value={aiPassword}
          onChange={(e) => setAiPassword(e.target.value)}
        />
      </div>

      <div className="status">{status}</div>

      <button onClick={handleSave} disabled={isSaving}>
        저장하기
      </button>
    </div>
  );
}

export default App;
