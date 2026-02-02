import { useEffect, useState } from "react";
import type { Team } from "../../../schemas/auth.type";
import type { FolderResponseData } from "@repo/api";
import { buildDashboardUrl } from "../utils";

type UseTeamFolderArgs = {
  authState: {
    userInfo?: {
      teams?: Team[];
      selectedTeamUuid?: string;
    };
  } | null;
  isAuthLoading: boolean;
  isLoggedIn: boolean;
  isMountedRef: React.MutableRefObject<boolean>;
  onError: (message: string) => void;
};

function useTeamFolder({
  authState,
  isAuthLoading,
  isLoggedIn,
  isMountedRef,
  onError,
}: UseTeamFolderArgs) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamUuid, setSelectedTeamUuid] = useState("");
  const [folders, setFolders] = useState<FolderResponseData[]>([]);
  const [selectedFolderUuid, setSelectedFolderUuid] = useState("");
  const [dashboardUrl, setDashboardUrl] = useState("");

  const loadFolders = async (teamUuid: string) => {
    if (!isMountedRef.current) return;
    if (!teamUuid) {
      setFolders([]);
      setSelectedFolderUuid("");
      setDashboardUrl("");
      return;
    }

    const response = await chrome.runtime.sendMessage({
      action: "getFolders",
      teamUuid,
    });

    if (!isMountedRef.current) return;

    if (!response?.success) {
      setFolders([]);
      setSelectedFolderUuid("");
      onError("폴더 조회 실패: " + (response?.error || "알 수 없는 오류"));
      return;
    }

    const folderList = (response.data ?? []) as FolderResponseData[];
    setFolders(folderList);

    const storage = await chrome.storage.local.get("selected_folder_uuid");
    if (!isMountedRef.current) return;
    const storedFolderUuid = storage?.selected_folder_uuid as
      | string
      | undefined;

    const nextFolderUuid =
      (storedFolderUuid &&
        folderList.some((folder) => folder.folderUuid === storedFolderUuid) &&
        storedFolderUuid) ||
      folderList[0]?.folderUuid ||
      "";

    setSelectedFolderUuid(nextFolderUuid);
    setDashboardUrl(buildDashboardUrl(teamUuid, nextFolderUuid));

    if (nextFolderUuid) {
      if (!isMountedRef.current) return;
      await chrome.runtime.sendMessage({
        action: "selectFolder",
        folderUuid: nextFolderUuid,
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    (async () => {
      if (isAuthLoading || !isLoggedIn) return;
      if (!isMounted) return;

      if (authState?.userInfo) {
        const { teams: userTeams, selectedTeamUuid: storedTeamUuid } =
          authState.userInfo;
        setTeams(userTeams ?? []);
        const nextTeamUuid = storedTeamUuid || userTeams?.[0]?.teamUuid || "";
        setSelectedTeamUuid(nextTeamUuid);
        setDashboardUrl(buildDashboardUrl(nextTeamUuid));
        if (!isMounted) return;
        await loadFolders(nextTeamUuid);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [authState, isAuthLoading, isLoggedIn]);

  const handleTeamChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextTeamUuid = e.target.value;
    const previousTeamUuid = selectedTeamUuid;
    const previousFolderUuid = selectedFolderUuid;

    setSelectedTeamUuid(nextTeamUuid);
    setDashboardUrl(buildDashboardUrl(nextTeamUuid, selectedFolderUuid));

    const response = await chrome.runtime.sendMessage({
      action: "selectTeam",
      teamUuid: nextTeamUuid,
    });

    if (!response?.success) {
      setSelectedTeamUuid(previousTeamUuid);
      setSelectedFolderUuid(previousFolderUuid);
      setDashboardUrl(buildDashboardUrl(previousTeamUuid, previousFolderUuid));
      onError("팀 변경 실패: " + (response?.error || "알 수 없는 오류"));
      await loadFolders(previousTeamUuid);
      return;
    }

    await loadFolders(nextTeamUuid);
  };

  const handleFolderChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const nextFolderUuid = e.target.value;
    const previousFolderUuid = selectedFolderUuid;

    setSelectedFolderUuid(nextFolderUuid);
    setDashboardUrl(buildDashboardUrl(selectedTeamUuid, nextFolderUuid));

    const response = await chrome.runtime.sendMessage({
      action: "selectFolder",
      folderUuid: nextFolderUuid,
    });

    if (!response?.success) {
      setSelectedFolderUuid(previousFolderUuid);
      setDashboardUrl(buildDashboardUrl(selectedTeamUuid, previousFolderUuid));
      onError("폴더 변경 실패: " + (response?.error || "알 수 없는 오류"));
    }
  };

  return {
    teams,
    selectedTeamUuid,
    folders,
    selectedFolderUuid,
    dashboardUrl,
    handleTeamChange,
    handleFolderChange,
    loadFolders,
  };
}

export default useTeamFolder;
