import { BASE_URL } from "./constants";

export const buildDashboardUrl = (teamUuid: string, folderUuid?: string) => {
  if (!teamUuid) return `${BASE_URL}/my-teams`;
  const baseUrl = `${BASE_URL}/team/${teamUuid.toLowerCase()}`;
  return folderUuid ? `${baseUrl}?folderUuid=${folderUuid}` : baseUrl;
};
