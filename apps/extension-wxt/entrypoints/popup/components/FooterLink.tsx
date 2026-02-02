type FooterLinkProps = {
  href: string;
  disabled: boolean;
  onClick: (event: React.MouseEvent) => void;
};

function FooterLink({ href = "#", disabled, onClick }: FooterLinkProps) {
  return (
    <footer className="footer">
      <a
        href={href}
        onClick={onClick}
        className={`dashboard-link ${disabled ? "disabled" : ""}`}
      >
        대시보드 열기 →
      </a>
    </footer>
  );
}

export default FooterLink;
