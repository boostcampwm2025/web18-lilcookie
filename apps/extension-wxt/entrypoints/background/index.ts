import { login, logout, getAuthState, selectTeam } from "./auth.background";
import { summarizeContent, saveLink, getFolders } from "./messaging.background";
import {
  setupAlarms,
  setupNotificationHandlers,
} from "./notifications.background";
import { setupTabListeners } from "./tabs.background";

export default defineBackground(() => {
  setupAlarms();
  setupNotificationHandlers();
  setupTabListeners();

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case "saveLink":
        saveLink(request.data).then(sendResponse);
        return true;
      case "summarize":
        summarizeContent(request.content)
          .then(sendResponse)
          .catch((error) =>
            sendResponse({ success: false, error: error.message }),
          );
        return true;
      case "login":
        login().then(sendResponse);
        return true;
      case "logout":
        logout().then(() => sendResponse({ success: true }));
        return true;
      case "getAuthState":
        getAuthState().then(sendResponse);
        return true;
      case "selectTeam":
        selectTeam(request.teamUuid)
          .then(() => sendResponse({ success: true }))
          .catch((error) =>
            sendResponse({
              success: false,
              error: error instanceof Error ? error.message : "팀 변경 실패",
            }),
          );
        return true;
      case "getFolders":
        getFolders(request.teamUuid)
          .then(sendResponse)
          .catch((error) =>
            sendResponse({
              success: false,
              error: error instanceof Error ? error.message : "폴더 조회 실패",
            }),
          );
        return true;
      case "selectFolder":
        chrome.storage.local
          .set({ selected_folder_uuid: request.folderUuid })
          .then(() => sendResponse({ success: true }))
          .catch((error) =>
            sendResponse({
              success: false,
              error: error instanceof Error ? error.message : "폴더 변경 실패",
            }),
          );
        return true;
    }
  });
});
