import { Readability, isProbablyReaderable } from "@mozilla/readability";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    // background에서 메시지 받으면 content 추출
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "extractContent") {
        try {
          if (!isProbablyReaderable(document)) {
            // 1. 먼저 현재 document의 meta 태그 확인
            let ogTitle = document
              .querySelector('meta[property="og:title"]')
              ?.getAttribute("content");
            let ogDescription = document
              .querySelector('meta[property="og:description"]')
              ?.getAttribute("content");
            let ogImage = document
              .querySelector('meta[property="og:image"]')
              ?.getAttribute("content");

            // 2. meta 태그가 없으면 iframe 안 검색
            if (!ogTitle || !ogDescription) {
              const iframes = document.querySelectorAll("iframe");

              for (const iframe of iframes) {
                try {
                  // Same-origin이어야 접근 가능 (보안 제약)
                  const iframeDoc =
                    iframe.contentDocument || iframe.contentWindow?.document;

                  if (iframeDoc) {
                    ogTitle =
                      ogTitle ||
                      iframeDoc
                        .querySelector('meta[property="og:title"]')
                        ?.getAttribute("content");
                    ogDescription =
                      ogDescription ||
                      iframeDoc
                        .querySelector('meta[property="og:description"]')
                        ?.getAttribute("content");
                    ogImage =
                      ogImage ||
                      iframeDoc
                        .querySelector('meta[property="og:image"]')
                        ?.getAttribute("content");

                    if (ogTitle && ogDescription) break; // 찾았으면 중단
                  }
                } catch (error) {
                  // Cross-origin iframe은 접근 불가 (에러 무시)
                  console.log("Cannot access iframe:", error);
                }
              }
            }
            // Readability article 형식으로 변환
            const fallbackArticle = {
              title: ogTitle || document.title || "",
              content: ogDescription || "",
              textContent: ogDescription || "",
              length: (ogDescription || "").length,
              excerpt: ogDescription || "",
              byline: null,
              dir: null,
              siteName:
                document
                  .querySelector('meta[property="og:site_name"]')
                  ?.getAttribute("content") || null,
              lang: document.documentElement.lang || null,
              publishedTime:
                document
                  .querySelector('meta[property="article:published_time"]')
                  ?.getAttribute("content") || null,
            };

            sendResponse(fallbackArticle);
            // sendResponse(null);
            return;
          }
          const documentClone = document.cloneNode(true) as Document;
          const article = new Readability(documentClone).parse();
          console.log("---article---", article);

          sendResponse(article);
        } catch (error) {
          sendResponse(null);
        }
      }
      return true; // 비동기 응답
    });
  },
});
