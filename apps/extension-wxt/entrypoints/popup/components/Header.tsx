import { LogoIcon } from "./icons";

type HeaderProps = {
  showLogout: boolean;
  onLogout?: () => void;
};

function Header({ showLogout, onLogout }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-icon">
          <LogoIcon />
        </div>
        <div className="header-text">
          <h1 className="app-name">TeamStash</h1>
          <p className="tagline">링크를 빠르게 저장하세요</p>
        </div>
      </div>
      {showLogout && (
        <button className="settings-link" onClick={onLogout}>
          로그아웃
        </button>
      )}
    </header>
  );
}

export default Header;
