import api from "./api";
import { getAuthState } from "./auth.background";

const MAX_AI_INPUT_CHARACTER_COUNT = 300;

export async function summarizeContent(content: string) {
  try {
    const response = await api.post<{ data: unknown }>("/ai/summary", {
      content: content.slice(0, MAX_AI_INPUT_CHARACTER_COUNT),
    });
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

export async function saveLink(formData: any) {
  try {
    const authState = await getAuthState();
    if (!authState.userInfo) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const { teamId, userId } = authState.userInfo;

    const response = await api.post("/links", {
      ...formData,
      teamId,
      userId,
    }, {
      params: { teamId },
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
