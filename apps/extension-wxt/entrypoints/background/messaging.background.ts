import { getAuthState } from "./auth.background";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const POST_URL = BASE_URL + "/links";
const MAX_AI_INPUT_CHARACTER_COUNT = 300;

export async function summarizeContent(content: string) {
  try {
    const authState = await getAuthState();
    if (!authState.isLoggedIn || !authState.accessToken) {
      return { success: false, error: "로그인이 필요합니다" };
    }

    const response = await fetch(BASE_URL + "/ai/summary", {
      method: "POST",
      body: JSON.stringify({
        content: content.slice(0, MAX_AI_INPUT_CHARACTER_COUNT),
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${authState.accessToken}`,
      },
    });

    if (response.ok) {
      const json = await response.json();
      return { success: true, data: json.data };
    } else {
      const errorJson = await response.json().catch(() => ({}));
      return { success: false, error: errorJson.message || "요약 실패" };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 에러",
    };
  }
}

export async function saveLink(formData: any) {
  try {
    const authState = await getAuthState();
    if (
      !authState.isLoggedIn ||
      !authState.accessToken ||
      !authState.userInfo
    ) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const { teamId, userId } = authState.userInfo;

    const urlWithTeamId = `${POST_URL}?teamId=${encodeURIComponent(teamId)}`;

    const requestBody = {
      ...formData,
      teamId,
      userId,
    };

    const response = await fetch(urlWithTeamId, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${authState.accessToken}`,
      },
    });

    if (response.ok) {
      const json = await response.json();
      return { success: true, data: json };
    } else {
      const errorJson = await response.json().catch(() => ({}));
      return { success: false, error: errorJson.message || "저장 실패" };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 에러",
    };
  }
}
