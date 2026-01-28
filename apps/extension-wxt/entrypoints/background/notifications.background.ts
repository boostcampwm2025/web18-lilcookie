import { getAuthState } from "./auth.background";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FE_BASE_URL = import.meta.env.VITE_FE_BASE_URL;
const POST_URL = BASE_URL + "/links";

export function setupAlarms() {
  chrome.alarms.create("pollLinks", { periodInMinutes: 0.5 });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "pollLinks") {
      checkNewLinks();
    }
  });
}

export function setupNotificationHandlers() {
  chrome.notifications.onClicked.addListener(async (notificationId) => {
    if (notificationId === "teamstash-new-links") {
      const authState = await getAuthState();
      if (authState.isLoggedIn && authState.userInfo?.teamId) {
        chrome.tabs.create({
          url: `${FE_BASE_URL}/${authState.userInfo.teamId.toLowerCase()}`,
        });
      }
      chrome.notifications.clear(notificationId);
      await chrome.storage.local.set({ unseenLinkCount: 0 });
    }
  });
}

async function checkNewLinks() {
  try {
    const authState = await getAuthState();
    if (
      !authState.isLoggedIn ||
      !authState.accessToken ||
      !authState.userInfo
    ) {
      return;
    }

    const { teamId, userId } = authState.userInfo;
    const { lastCheck } = await chrome.storage.local.get("lastCheck");

    const now = new Date();
    const formattedNow = now.toISOString();

    if (!lastCheck) {
      await chrome.storage.local.set({ lastCheck: formattedNow });
      return;
    }

    const url = new URL(POST_URL);
    url.searchParams.append("teamId", teamId);
    url.searchParams.append("createdAfter", String(lastCheck));

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${authState.accessToken}`,
      },
    });

    if (response.ok) {
      const json = await response.json();
      const links = json.data || [];
      const newLinks = links.filter((link: any) => link.createdBy !== userId);

      if (Array.isArray(newLinks) && newLinks.length > 0) {
        const { unseenLinkCount } =
          await chrome.storage.local.get("unseenLinkCount");
        const totalNewLinks = (Number(unseenLinkCount) || 0) + newLinks.length;

        chrome.notifications.create("teamstash-new-links", {
          type: "basic",
          iconUrl: "images/icon-128.png",
          title: "[TeamStash] 새로운 링크 알림",
          message: `${totalNewLinks}개의 새로운 링크가 등록되었습니다.`,
          priority: 2,
        });

        chrome.storage.local.set({ unseenLinkCount: totalNewLinks });
      }

      await chrome.storage.local.set({ lastCheck: formattedNow });
    }
  } catch (error) {}
}
