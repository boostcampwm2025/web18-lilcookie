import { z } from "zod";
import { LinkResponseDataSchema } from "@repo/api";
import api from "./api";
import { getAuthState } from "./auth.background";

const FE_BASE_URL = import.meta.env.VITE_FE_BASE_URL;

const LinksApiResponseSchema = z.object({
  data: z.array(LinkResponseDataSchema),
});

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
      if (authState.isLoggedIn && authState.userInfo?.selectedTeamUuid) {
        chrome.tabs.create({
          url: `${FE_BASE_URL}/my-teams`,
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
    if (!authState.isLoggedIn || !authState.userInfo) {
      return;
    }

    const { selectedTeamUuid: teamUuid, userUuid } = authState.userInfo;
    const { lastCheck } = await chrome.storage.local.get("lastCheck");

    const now = new Date();
    const formattedNow = now.toISOString();

    if (!lastCheck) {
      await chrome.storage.local.set({ lastCheck: formattedNow });
      return;
    }

    const response = await api.get("/links", {
      params: {
        teamUuid,
        createdAfter: lastCheck,
      },
    });

    const parsed = LinksApiResponseSchema.safeParse(response.data);
    const links = parsed.success ? parsed.data.data : [];
    const newLinks = links.filter((link) => link.createdBy.userUuid !== userUuid);

    if (newLinks.length > 0) {
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
  } catch (error) {}
}
