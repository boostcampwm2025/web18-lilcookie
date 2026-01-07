export default defineBackground(() => {
  const isDev = false;
  const BASE_URL = isDev
    ? "http://localhost:3000"
    : "https://link-repository.eupthere.uk";
  const FE_BASE_URL = isDev
    ? "http://localhost:5173"
    : "https://link-repository.eupthere.uk";
  const POST_URL = BASE_URL + "/api/links";

  const MAX_AI_INPUT_CHARACTER_COUNT = 300;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveLink") {
      saveLink(request.data)
        .then((response) => {
          console.log("💾 링크 저장 응답:", response);
          sendResponse(response);
        })
        .catch((error) => {
          console.error("💾 링크 저장 에러:", error);
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : "알 수 없는 에러"
          });
        });
      return true; // Will respond asynchronously
    } else if (request.action === "summarize") {
      console.log("🤖 AI 요약 요청 받음:", {
        contentLength: request.content?.length,
        hasPassword: !!request.aiPassword
      });

      // Firefox MV2 compatibility: explicitly handle async response
      (async () => {
        try {
          const response = await summarizeContent(request.content, request.aiPassword);
          console.log("✅ AI 요약 응답:", response);
          console.log("📤 sendResponse 호출 중:", response);
          sendResponse(response);
        } catch (error) {
          console.error("❌ AI 요약 에러:", error);
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : "알 수 없는 에러"
          });
        }
      })();

      return true; // Keep message channel open for async response
    }
  });

  async function summarizeContent(content, aiPassword) {
    try {
      console.log("🌐 API 요청 시작:", BASE_URL + "/api/ai/summary");
      const response = await fetch(BASE_URL + "/api/ai/summary", {
        method: "POST",
        body: JSON.stringify({
          content: content.slice(0, MAX_AI_INPUT_CHARACTER_COUNT),
          aiPassword,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });

      console.log("📡 API 응답 상태:", response.status, response.statusText);

      if (response.ok) {
        const json = await response.json();
        console.log("📦 응답 데이터:", json);
        return { success: true, data: json.data };
      } else {
        const errorJson = await response.json().catch(() => ({}));
        console.error("🚫 API 에러 응답:", errorJson);
        return { success: false, error: errorJson.message || "요약 실패" };
      }
    } catch (error) {
      console.error("💥 Fetch 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 에러",
      };
    }
  }

  async function saveLink(formData) {
    try {
      const response = await fetch(POST_URL, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });

      if (response.ok) {
        const json = await response.json();
        return { success: true, data: json };
      } else {
        return { success: false, error: "저장 실패" };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 에러",
      };
    }
  }

  // 알람 설정: 1분마다 실행
  chrome.alarms.create("pollLinks", { periodInMinutes: 0.5 });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "pollLinks") {
      checkNewLinks();
    }
  });

  // Notification click handler: open dashboard
  chrome.notifications.onClicked.addListener(async (notificationId) => {
    if (notificationId === "teamstash-new-links") {
      const { teamId } = await chrome.storage.sync.get("teamId");
      if (teamId && typeof teamId === "string") {
        chrome.tabs.create({ url: `${FE_BASE_URL}/${teamId.toLowerCase()}` });
      }
      chrome.notifications.clear(notificationId);
      await chrome.storage.local.set({ unseenLinkCount: 0 });
    }
  });

  async function checkNewLinks() {
    try {
      const { teamId, lastCheck, camperId } = await chrome.storage.sync.get([
        "teamId",
        "lastCheck",
        "camperId",
      ]);

      if (!teamId) return;

      const now = new Date();
      const formattedNow = now.toISOString();

      if (!lastCheck) {
        await chrome.storage.sync.set({ lastCheck: formattedNow });
        return;
      }

      const url = new URL(POST_URL);
      url.searchParams.append("teamId", String(teamId));
      url.searchParams.append("createdAfter", String(lastCheck));

      const response = await fetch(url.toString());
      if (response.ok) {
        const json = await response.json();
        const links = json.data || [];
        const newLinks = links.filter((link) => link.createdBy !== camperId);

        if (Array.isArray(newLinks) && newLinks.length > 0) {
          const { unseenLinkCount } = await chrome.storage.local.get([
            "unseenLinkCount",
          ]);
          const totalNewLinks = (Number(unseenLinkCount) || 0) + newLinks.length;

          const notificationId = "teamstash-new-links";
          chrome.notifications.create(notificationId, {
            type: "basic",
            iconUrl: "images/icon-128.png",
            title: "[TeamStash] 새로운 링크 알림",
            message: `${totalNewLinks}개의 새로운 링크가 등록되었습니다.`,
            priority: 2,
          });

          chrome.storage.local.set({
            unseenLinkCount: totalNewLinks,
          });
        }

        await chrome.storage.sync.set({ lastCheck: formattedNow });
      }
    } catch (error) {
      console.error("Error checking links:", error);
    }
  }

  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    console.log("🔶 Firefox 백그라운드: 탭 활성화됨", activeInfo.tabId);
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (tab) {
        showSummary(tab);
        checkDashboardVisit(tab);
      }
    } catch (error) {
      console.error("🔶 탭 활성화 에러:", error);
    }
  });
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab) {
      console.log("🔶 Firefox 백그라운드: 페이지 로드 완료", tabId, tab.url);
      showSummary(tab);
      checkDashboardVisit(tab);
    }
  });

  async function checkDashboardVisit(tab: chrome.tabs.Tab) {
    try {
      if (!tab || !tab.url) return;

      const { teamId } = await chrome.storage.sync.get("teamId");
      if (!teamId || typeof teamId !== "string") return;

      const dashboardUrl = `${FE_BASE_URL}/${teamId.toLowerCase()}`;

      if (tab.url.startsWith(dashboardUrl)) {
        await chrome.storage.local.set({ unseenLinkCount: 0 });
        chrome.notifications.clear("teamstash-new-links");
      }
    } catch (error) {
      console.debug("Error checking dashboard visit:", error);
    }
  }

  async function showSummary(tab: chrome.tabs.Tab) {
    try {
      if (!tab || !tab.id) {
        console.log("🔶 탭 정보 없음");
        return;
      }

      console.log("🔶 showSummary 시작:", tab.id);
      console.log("🔶 탭 URL:", tab.url);

      if (!tab.url?.startsWith("http")) {
        console.log("🔶 HTTP 아님, 건너뜀");
        chrome.storage.local.set({ pageContent: null });
        return;
      }

      console.log("🔶 content script에 메시지 전송 중...");
      chrome.tabs.sendMessage(
        tab.id,
        { action: "extractContent" },
        (response) => {
          console.log("🔶 content script 응답:", response);
          if (chrome.runtime.lastError) {
            console.error("🔶 메시지 전송 에러:", chrome.runtime.lastError);
          }
          chrome.storage.local.set({ pageContent: response || null });
        }
      );
    } catch (error) {
      console.error(
        "🔶 showSummary 에러:",
        error instanceof Error ? error.message : String(error)
      );
      chrome.storage.local.set({ pageContent: null });
    }
  }
});
