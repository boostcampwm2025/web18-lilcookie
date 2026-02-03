type PageInfoCardProps = {
  title?: string;
  url?: string;
  favIconUrl?: string;
};

function PageInfoCard({ title, url, favIconUrl }: PageInfoCardProps) {
  return (
    <div className="page-info-card">
      <div className="page-icon">
        {favIconUrl && <img src={favIconUrl} alt="favicon" className="favicon" />}
      </div>
      <div className="page-details">
        <h2 className="page-title">{title || "Loading..."}</h2>
        <p className="page-url">{url || "Loading..."}</p>
      </div>
    </div>
  );
}

export default PageInfoCard;
