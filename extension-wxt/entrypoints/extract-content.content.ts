import { Readability, isProbablyReaderable } from "@mozilla/readability";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    // background에서 메시지 받으면 content 추출
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "extractContent") {
        try {
          if (!isProbablyReaderable(document)) {
            sendResponse(null);
            return;
          }
          const documentClone = document.cloneNode(true) as Document;
          const article = new Readability(documentClone).parse();
          sendResponse(article);
        } catch (error) {
          sendResponse(null);
        }
      }
      return true; // 비동기 응답
    });
  },
});
