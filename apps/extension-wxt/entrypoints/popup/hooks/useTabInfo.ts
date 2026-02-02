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
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!isMounted) return;

      if (activeTab) {
        setTab({
          title: activeTab.title || "Loading...",
          url: activeTab.url || "Loading...",
          favIconUrl: activeTab.favIconUrl,
        });

        const { pageContent } = await chrome.storage.session.get("pageContent");
        if (!isMounted) return;

        const isReaderable = (pageContent as any)?.textContent;
        setIsAiDisabled(!isReaderable || hasNoTeams);
      }
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
