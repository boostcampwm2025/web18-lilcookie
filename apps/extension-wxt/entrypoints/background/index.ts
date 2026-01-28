import { login, logout, getAuthState } from "./auth.background";
import { summarizeContent, saveLink } from "./messaging.background";
import { setupAlarms, setupNotificationHandlers } from "./notifications.background";
import { setupTabListeners } from "./tabs.background";

export default defineBackground(() => {
  setupAlarms();
  setupNotificationHandlers();
  setupTabListeners();

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveLink") {
      saveLink(request.data).then(sendResponse);
      return true;
    } else if (request.action === "summarize") {
      summarizeContent(request.content)
        .then(sendResponse)
        .catch((error) =>
          sendResponse({ success: false, error: error.message }),
        );
      return true;
    } else if (request.action === "login") {
      login().then(sendResponse);
      return true;
    } else if (request.action === "logout") {
      logout().then(() => sendResponse({ success: true }));
      return true;
    } else if (request.action === "getAuthState") {
      getAuthState().then(sendResponse);
      return true;
    }
  });
});
