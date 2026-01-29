import api from "./api";
import { getAuthState } from "./auth.background";
import { API_CONFIG } from "../../config/api";

const MAX_AI_INPUT_CHARACTER_COUNT = 300;

export async function summarizeContent(content: string) {
  try {
    const response = await api.post<{ data: unknown }>(
      "/ai/summary",
      { content: content.slice(0, MAX_AI_INPUT_CHARACTER_COUNT) },
      { "axios-retry": { retries: API_CONFIG.retry.ai.maxRetries } },
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    if (error instanceof Error && error.message.includes("401")) {
      return { success: false, error: "로그인이 필요합니다" };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "요약 실패",
    };
  }
}

interface SaveLinkFormData {
  url: string;
  title: string;
  tags: string[];
  summary: string;
  folderUuid?: string;
}

export async function saveLink(formData: SaveLinkFormData) {
  try {
    const authState = await getAuthState();
    if (!authState.userInfo) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const { selectedTeamUuid: teamUuid } = authState.userInfo;

    const response = await api.post("/links", {
      teamUuid,
      folderUuid: formData.folderUuid,
      url: formData.url,
      title: formData.title,
      tags: formData.tags,
      summary: formData.summary,
    });

    return { success: true, data: response.data };
  } catch (error) {
    if (error instanceof Error && error.message.includes("401")) {
      return { success: false, error: "로그인이 필요합니다." };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "저장 실패",
    };
  }
}
