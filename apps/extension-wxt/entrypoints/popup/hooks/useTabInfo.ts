import { useEffect, useState } from "react";
import type { TabInfo } from "../types";

type UseTabInfoArgs = {
  isLoggedIn: boolean;
  hasNoTeams: boolean;
};

function useTabInfo({ isLoggedIn, hasNoTeams }: UseTabInfoArgs) {
  const [tab, setTab] = useState<TabInfo | null>(null);
  const [isAiDisabled, setIsAiDisabled] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!isLoggedIn) {
      setTab(null);
      setIsAiDisabled(true);
      return () => {
        isMounted = false;
      };
    }

    (async () => {
      const [tabResult, pageContentResult] = await Promise.all([
        chrome.tabs.query({
          active: true,
          currentWindow: true,
        }),
        chrome.storage.session.get("pageContent"),
      ]);

      if (!isMounted) return;

      const [activeTab] = tabResult;

      if (activeTab) {
        setTab({
          title: activeTab.title || "Loading...",
          url: activeTab.url || "Loading...",
          favIconUrl: activeTab.favIconUrl,
        });
      }

      const isReaderable = (pageContentResult as any)?.pageContent?.textContent;
      setIsAiDisabled(!isReaderable || hasNoTeams);
    })();

    return () => {
      isMounted = false;
    };
  }, [hasNoTeams, isLoggedIn]);

  return {
    tab,
    isAiDisabled,
    setIsAiDisabled,
  };
}

export default useTabInfo;
