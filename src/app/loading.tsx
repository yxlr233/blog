export default function Loading() {
  return (
    <main className="page route-loading" aria-busy="true">
      <p className="sr-only" role="status">页面加载中</p>
      <div className="route-loading-header" aria-hidden="true">
        <span className="loading-block loading-eyebrow" />
        <span className="loading-block loading-title" />
        <span className="loading-block loading-copy" />
      </div>
      <div className="route-loading-list" aria-hidden="true">
        {[0, 1, 2].map((item) => (
          <div className="route-loading-item" key={item}>
            <span className="loading-block loading-meta" />
            <span className="loading-block loading-heading" />
            <span className="loading-block loading-summary" />
            <span className="loading-block loading-tag" />
          </div>
        ))}
      </div>
    </main>
  );
}
