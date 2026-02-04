import type { Folder } from "../../types";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface SidebarProps {
  onCreateTeam?: () => void;
  onCreateFolder?: (teamUuid: string) => void;
  onDeleteFolder?: (
    teamUuid: string,
    folderUuid: string,
    folderName: string,
  ) => void;
  selectedFolderUuid?: string | null;
  onFolderSelect?: (folder: Folder) => void;
  folderRefreshKey?: number;
}

interface HeaderProps {
  showMyPageLink?: boolean;
  extraButtons?: React.ReactNode;
}

interface LayoutProps {
  children: React.ReactNode;
  sidebarProps?: SidebarProps;
  headerProps?: HeaderProps;
}

const Layout = ({ children, sidebarProps = {}, headerProps = {} }: LayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <Sidebar {...sidebarProps} />

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <Header {...headerProps} />

        {/* 컨텐츠 */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
