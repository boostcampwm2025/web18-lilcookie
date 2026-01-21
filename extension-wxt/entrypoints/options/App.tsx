import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [aiPassword, setAiPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 페이지 로드 시 저장된 설정 불러오기
  useEffect(() => {
    chrome.storage.sync.get({ aiPassword: "" }, (items: any) => {
      if (chrome.runtime.lastError) {
        return;
      }
      setAiPassword(items.aiPassword || "");
    });
  }, []);

  // 설정 저장
  const handleSave = () => {
    setIsSaving(true);

    chrome.storage.sync.set({ aiPassword }, () => {
      if (chrome.runtime.lastError) {
        setStatus("저장 실패: " + chrome.runtime.lastError.message);
        setIsSaving(false);
        return;
      }

      setStatus("설정이 저장되었습니다.");

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
