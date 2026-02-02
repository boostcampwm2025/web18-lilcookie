import { useState } from "react";
import { MAX_CHARACTER_COUNT, MAX_TAG_COUNT } from "../constants";

type UseAiSummaryArgs = {
  aiButtonRef: React.RefObject<HTMLButtonElement | null>;
  setComment: (value: string) => void;
  setTags: (value: string) => void;
  setIsAiDisabled: (value: boolean) => void;
};

function useAiSummary({
  aiButtonRef,
  setComment,
  setTags,
  setIsAiDisabled,
}: UseAiSummaryArgs) {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiCompleted, setIsAiCompleted] = useState(false);

  const handleAiClick = async () => {
    if (!aiButtonRef.current) return;

    const originalHTML = aiButtonRef.current.innerHTML;

    try {
      setIsAiLoading(true);
      setIsAiDisabled(true);

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
        if (aiButtonRef.current) {
          const svg = aiButtonRef.current.querySelector("svg");
          aiButtonRef.current.innerHTML =
            (svg?.outerHTML || "") + "AI 생성 실패";
        }
        setTimeout(() => {
          if (aiButtonRef.current) {
            aiButtonRef.current.innerHTML = originalHTML;
          }
          setIsAiDisabled(false);
          setIsAiLoading(false);
        }, 2000);
      }
    } catch (error) {
      console.error("AI Error:", error);
      alert("오류가 발생했습니다: " + (error as Error).message);
      setIsAiLoading(false);
      setIsAiDisabled(false);
      if (aiButtonRef.current) {
        aiButtonRef.current.innerHTML = originalHTML;
      }
    }
  };

  return {
    isAiLoading,
    isAiCompleted,
    handleAiClick,
  };
}

export default useAiSummary;
