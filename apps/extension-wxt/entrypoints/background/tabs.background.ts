import { getAuthState } from "./auth.background";

const FE_BASE_URL = import.meta.env.VITE_FE_BASE_URL;

export function setupTabListeners() {
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (tab) {
        showSummary(tab);
        checkDashboardVisit(tab);
      }
    } catch (error) {}
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab) {
      showSummary(tab);
      checkDashboardVisit(tab);
    }
  });
}

async function checkDashboardVisit(tab: chrome.tabs.Tab) {
  try {
    if (!tab || !tab.url) return;

    const authState = await getAuthState();
    if (!authState.isLoggedIn || !authState.userInfo?.teamId) return;

    const dashboardUrl = `${FE_BASE_URL}/${authState.userInfo.teamId.toLowerCase()}`;

    if (tab.url.startsWith(dashboardUrl)) {
      await chrome.storage.local.set({ unseenLinkCount: 0 });
      chrome.notifications.clear("teamstash-new-links");
    }
  } catch (error) {}
}

async function showSummary(tab: chrome.tabs.Tab) {
  try {
    if (!tab || !tab.id) {
      return;
    }

    if (!tab.url?.startsWith("http")) {
      chrome.storage.session.set({ pageContent: null });
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "extractContent",
    });
    chrome.storage.session.set({ pageContent: response || null });
  } catch (error) {
    chrome.storage.session.set({ pageContent: null });
  }
}
