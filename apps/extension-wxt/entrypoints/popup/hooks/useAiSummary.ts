import { useState } from "react";
import { MAX_CHARACTER_COUNT, MAX_TAG_COUNT } from "../constants";

type UseAiSummaryArgs = {
  setComment: (value: string) => void;
  setTags: (value: string) => void;
  setIsAiDisabled: (value: boolean) => void;
  onError: (message: string) => void;
};

function useAiSummary({
  setComment,
  setTags,
  setIsAiDisabled,
  onError,
}: UseAiSummaryArgs) {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiCompleted, setIsAiCompleted] = useState(false);
  const [isAiFailed, setIsAiFailed] = useState(false);

  const handleAiClick = async () => {
    try {
      setIsAiLoading(true);
      setIsAiDisabled(true);
      setIsAiFailed(false);

      const { pageContent } = await chrome.storage.session.get("pageContent");

      if (!pageContent || !(pageContent as any)?.textContent) {
        setIsAiLoading(false);
        setIsAiDisabled(false);
        return;
      }

      const response = await chrome.runtime.sendMessage({
        action: "summarize",
        content: (pageContent as any).textContent,
      });

      if (response && response.success) {
        const { summary, tags: aiTags } = response.data;
        if (summary) {
          setComment(String(summary).slice(0, MAX_CHARACTER_COUNT));
        }
        if (aiTags && Array.isArray(aiTags)) {
          setTags(aiTags.slice(0, MAX_TAG_COUNT).join(", "));
        }
        setIsAiCompleted(true);
        setIsAiLoading(false);
      } else {
        setIsAiFailed(true);
        setTimeout(() => {
          setIsAiFailed(false);
          setIsAiDisabled(false);
          setIsAiLoading(false);
        }, 2000);
      }
    } catch (error) {
      console.error("AI Error:", error);
      onError("오류가 발생했습니다: " + (error as Error).message);
      setIsAiLoading(false);
      setIsAiDisabled(false);
      setIsAiFailed(false);
    }
  };

  return {
    isAiLoading,
    isAiCompleted,
    isAiFailed,
    handleAiClick,
  };
}

export default useAiSummary;
