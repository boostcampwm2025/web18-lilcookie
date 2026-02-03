import { useEffect, useState } from "react";
import type { Team } from "../../../schemas/auth.type";

type AuthState = {
  isLoggedIn?: boolean;
  userInfo?: {
    teams?: Team[];
    selectedTeamUuid?: string;
  };
};

type UseAuthStateArgs = {
  onError: (message: string) => void;
};

function useAuthState({ onError }: UseAuthStateArgs) {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const response = await chrome.runtime.sendMessage({
        action: "getAuthState",
      });
      if (!isMounted) return;

      setAuthState(response ?? null);
      setIsLoggedIn(response?.isLoggedIn ?? false);
      setIsAuthLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async () => {
    const response = await chrome.runtime.sendMessage({ action: "login" });
    if (response?.success) {
      setIsLoggedIn(true);
      window.location.reload();
    } else {
      onError("로그인 실패: " + (response?.error || "알 수 없는 오류"));
    }
  };

  const logout = async () => {
    await chrome.runtime.sendMessage({ action: "logout" });
    setIsLoggedIn(false);
    setAuthState(null);
  };

  return {
    authState,
    isLoggedIn,
    isAuthLoading,
    login,
    logout,
  };
}

export default useAuthState;
