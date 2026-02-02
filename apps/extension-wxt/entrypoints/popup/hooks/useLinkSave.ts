import { useState } from "react";
import type { TabInfo } from "../types";
import { MAX_CHARACTER_COUNT, MAX_TAG_COUNT } from "../constants";

type UseLinkSaveArgs = {
  tab: TabInfo | null;
  selectedFolderUuid: string;
  onError: (message: string) => void;
};

function useLinkSave({
  tab,
  selectedFolderUuid,
  onError,
}: UseLinkSaveArgs) {
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);

  const commentLength = Math.min(comment.length, MAX_CHARACTER_COUNT);

  const tagCount = tags
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value !== "").length;

  const isSaveDisabled =
    !comment.trim() || !tags.trim() || isSaving || isSaveSuccess;

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARACTER_COUNT) {
      setComment(value);
    }
  };

  const handleCommentKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    const key = e.key;
    const allowedControls = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "Tab",
    ];
    if (allowedControls.includes(key)) return;

    const target = e.target as HTMLTextAreaElement;
    const selStart = target.selectionStart;
    const selEnd = target.selectionEnd;
    const selectionLength = Math.max(0, selEnd - selStart);
    const currentLength = target.value.length;

    const charLength = key === "Enter" ? 1 : key.length === 1 ? 1 : 0;
    if (charLength === 0) return;

    const newLength = currentLength - selectionLength + charLength;
    if (newLength > MAX_CHARACTER_COUNT) {
      e.preventDefault();
    }
  };

  const handleCommentPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text") || "";
    const target = e.target as HTMLTextAreaElement;
    const selStart = target.selectionStart;
    const selEnd = target.selectionEnd;
    const selectionLength = Math.abs(selEnd - selStart);
    const currentLength = target.value.length;
    const allowed = MAX_CHARACTER_COUNT - (currentLength - selectionLength);

    if (allowed <= 0) return;

    const toInsert = paste.slice(0, allowed);
    const before = target.value.slice(0, selStart);
    const after = target.value.slice(selEnd);
    const newValue = before + toInsert + after;

    setComment(newValue);

    setTimeout(() => {
      const newCursor = before.length + toInsert.length;
      target.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
  };

  const handleTagsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ",") {
      const target = e.target as HTMLInputElement;
      const commaCount = (target.value.match(/,/g) || []).length;

      if (commaCount >= MAX_TAG_COUNT - 1) {
        e.preventDefault();
        return;
      }

      const cursor = target.selectionStart || 0;
      const val = target.value;
      const before = val.slice(0, cursor);
      const after = val.slice(cursor);

      const trimmedBefore = before.trim();

      if (trimmedBefore.length === 0) {
        e.preventDefault();
        return;
      }

      if (trimmedBefore.endsWith(",")) {
        e.preventDefault();
        return;
      }

      if (after.trim().startsWith(",")) {
        e.preventDefault();
        return;
      }
    }
  };

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
        onError("저장 실패: " + (response?.error || "알 수 없는 오류"));
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Error:", error);
      onError("저장 중 오류가 발생했습니다: " + (error as Error).message);
      setIsSaving(false);
    }
  };

  return {
    comment,
    tags,
    commentLength,
    tagCount,
    isSaving,
    isSaveSuccess,
    isSaveDisabled,
    setComment,
    setTags,
    handleCommentChange,
    handleCommentKeyDown,
    handleCommentPaste,
    handleTagsChange,
    handleTagsKeyDown,
    handleSave,
  };
}

export default useLinkSave;
