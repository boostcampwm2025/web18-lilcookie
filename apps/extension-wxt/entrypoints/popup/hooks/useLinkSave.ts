import { useState } from "react";
import type { TabInfo } from "../types";
import { MAX_CHARACTER_COUNT, MAX_TAG_COUNT } from "../constants";

type UseLinkSaveArgs = {
  tab: TabInfo | null;
  comment: string;
  tags: string;
  selectedFolderUuid: string;
};

function useLinkSave({
  tab,
  comment,
  tags,
  selectedFolderUuid,
}: UseLinkSaveArgs) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tab) return;

    try {
      const formData = {
        url: tab.url,
        title: tab.title,
        tags: tags
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v !== "")
          .slice(0, MAX_TAG_COUNT),
        summary: comment.slice(0, MAX_CHARACTER_COUNT),
        folderUuid: selectedFolderUuid || undefined,
      };

      setIsSaving(true);

      const response = await chrome.runtime.sendMessage({
        action: "saveLink",
        data: formData,
      });

      if (response && response.success) {
        setIsSaveSuccess(true);
      } else {
        alert("저장 실패: " + (response?.error || "알 수 없는 오류"));
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("저장 중 오류가 발생했습니다: " + (error as Error).message);
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    isSaveSuccess,
    handleSave,
  };
}

export default useLinkSave;
