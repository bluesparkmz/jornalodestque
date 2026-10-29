function Bone({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <span className={`skeleton-bone ${className}`.trim()} style={style} aria-hidden="true" />;
}

export function SkeletonThumbPost() {
  return (
    <div className="thumb-post skeleton-block">
      <Bone className="skeleton-thumb" />
      <div className="thumb-post__body">
        <Bone className="skeleton-line skeleton-line--sm" />
        <Bone className="skeleton-line" />
        <Bone className="skeleton-line skeleton-line--short" />
      </div>
    </div>
  );
}

export function SkeletonFeature({ size = "lg" }: { size?: "lg" | "md" | "sm" }) {
  return <div className={`feature-card feature-card--${size} skeleton-feature`} aria-hidden="true" />;
}

export function SkeletonGridPost() {
  return (
    <div className="grid-post skeleton-block">
      <Bone className="skeleton-media" />
      <Bone className="skeleton-line skeleton-line--sm" />
      <Bone className="skeleton-line" />
      <Bone className="skeleton-line skeleton-line--mid" />
    </div>
  );
}

export function SkeletonPopularItem() {
  return (
    <div className="popular-item skeleton-block">
      <Bone className="skeleton-circle" />
      <div className="popular-item__body">
        <Bone className="skeleton-badge" />
        <Bone className="skeleton-line" />
        <Bone className="skeleton-line skeleton-line--mid" />
      </div>
    </div>
  );
}

export function SkeletonStackPost() {
  return (
    <div className="stack-post skeleton-block">
      <Bone className="skeleton-media skeleton-media--wide" />
      <Bone className="skeleton-badge" />
      <Bone className="skeleton-line skeleton-line--sm" />
      <Bone className="skeleton-line" />
      <Bone className="skeleton-line skeleton-line--mid" />
    </div>
  );
}

export function SkeletonNewspaperCard() {
  return (
    <div className="newspaper-card skeleton-block">
      <Bone className="skeleton-cover" />
      <div className="newspaper-card__body">
        <Bone className="skeleton-line" />
        <Bone className="skeleton-line skeleton-line--sm" />
        <Bone className="skeleton-btn" />
      </div>
    </div>
  );
}

export function SkeletonCategoryTile() {
  return (
    <div className="category-tile skeleton-block">
      <Bone className="skeleton-line skeleton-line--title" />
      <Bone className="skeleton-line" />
      <Bone className="skeleton-line skeleton-line--mid" />
    </div>
  );
}

export function SkeletonAdminCard() {
  return (
    <article className="skeleton-block" style={{ border: "1px solid var(--line)", padding: 20 }}>
      <Bone className="skeleton-line skeleton-line--title" />
      <Bone className="skeleton-line" />
      <Bone className="skeleton-btn" />
    </article>
  );
}

export function SkeletonListRow() {
  return (
    <div className="admin-article-row skeleton-block" style={{ padding: "16px 0", borderBottom: "1px solid var(--line)" }}>
      <Bone className="skeleton-thumb" />
      <div style={{ flex: 1 }}>
        <Bone className="skeleton-line" />
        <Bone className="skeleton-line skeleton-line--sm" />
      </div>
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="narrow skeleton-block" style={{ display: "grid", gap: 14 }}>
      <Bone className="skeleton-line skeleton-line--title" />
      <Bone className="skeleton-input" />
      <Bone className="skeleton-input" />
      <Bone className="skeleton-input skeleton-input--tall" />
      <Bone className="skeleton-btn" />
    </div>
  );
}

export function SkeletonArticleDetail() {
  return (
    <div className="container page-shell" aria-busy="true" aria-label="A carregar">
      <Bone className="skeleton-line skeleton-line--sm" style={{ width: 180, marginBottom: 18 }} />
      <div className="article-layout">
        <div>
          <Bone className="skeleton-badge" />
          <Bone className="skeleton-line skeleton-line--hero" />
          <Bone className="skeleton-line skeleton-line--hero" style={{ width: "70%" }} />
          <Bone className="skeleton-line skeleton-line--sm" style={{ width: 220, margin: "14px 0 22px" }} />
          <Bone className="skeleton-media skeleton-media--article" />
          <Bone className="skeleton-line" />
          <Bone className="skeleton-line" />
          <Bone className="skeleton-line skeleton-line--mid" />
          <Bone className="skeleton-line" />
          <Bone className="skeleton-line skeleton-line--short" />
        </div>
        <aside className="article-sidebar">
          <Bone className="skeleton-line skeleton-line--title" style={{ marginBottom: 16 }} />
          <SkeletonListRow />
          <SkeletonListRow />
          <SkeletonListRow />
        </aside>
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="home-page" aria-busy="true" aria-label="A carregar notícias">
      <div className="container">
        <section className="trending-row">
          <SkeletonThumbPost />
          <SkeletonThumbPost />
          <SkeletonThumbPost />
        </section>

        <section className="hero-grid">
          <SkeletonFeature size="lg" />
          <div className="hero-side">
            <SkeletonFeature size="sm" />
            <SkeletonFeature size="sm" />
          </div>
        </section>

        <section className="subfeature-row">
          <SkeletonGridPost />
          <SkeletonGridPost />
          <SkeletonGridPost />
          <SkeletonGridPost />
        </section>

        <section className="content-split">
          <div>
            <Bone className="skeleton-section-title" />
            <div className="recent-featured">
              <SkeletonFeature size="md" />
              <SkeletonFeature size="md" />
            </div>
            <div className="recent-grid">
              {Array.from({ length: 10 }, (_, i) => <SkeletonGridPost key={i} />)}
            </div>
          </div>
          <aside>
            <div className="popular-box">
              <Bone className="skeleton-section-title" />
              <SkeletonPopularItem />
              <SkeletonPopularItem />
              <SkeletonPopularItem />
              <SkeletonPopularItem />
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

export function NoticiasSkeleton() {
  return (
    <div className="container page-shell" aria-busy="true" aria-label="A carregar notícias">
      <Bone className="skeleton-section-title" />
      <div className="recent-featured" style={{ marginBottom: 28 }}>
        <SkeletonFeature size="md" />
        <SkeletonFeature size="md" />
      </div>
      <div className="news-list-grid">
        {Array.from({ length: 6 }, (_, i) => <SkeletonGridPost key={i} />)}
      </div>
    </div>
  );
}

export function CategoriasSkeleton() {
  return (
    <div className="container page-shell" aria-busy="true" aria-label="A carregar categorias">
      <Bone className="skeleton-section-title" />
      <Bone className="skeleton-line skeleton-line--mid" style={{ marginBottom: 28 }} />
      {Array.from({ length: 3 }, (_, section) => (
        <section key={section} className="category-band">
          <Bone className="skeleton-section-title" />
          <div className="category-grid-4">
            {Array.from({ length: 4 }, (_, i) => <SkeletonGridPost key={i} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

export function CategoryDetailSkeleton() {
  return (
    <div className="container page-shell" aria-busy="true" aria-label="A carregar categoria">
      <Bone className="skeleton-line skeleton-line--sm" style={{ width: 160, marginBottom: 14 }} />
      <Bone className="skeleton-section-title" />
      <div className="news-list-grid">
        {Array.from({ length: 6 }, (_, i) => <SkeletonGridPost key={i} />)}
      </div>
    </div>
  );
}

export function JornaisSkeleton() {
  return (
    <div className="container page-shell" aria-busy="true" aria-label="A carregar jornais">
      <Bone className="skeleton-section-title" />
      <Bone className="skeleton-line skeleton-line--mid" style={{ marginBottom: 24 }} />
      <div className="newspaper-grid">
        {Array.from({ length: 4 }, (_, i) => <SkeletonNewspaperCard key={i} />)}
      </div>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="container page-shell" aria-busy="true" aria-label="A carregar jornal">
      <Bone className="skeleton-line skeleton-line--sm" style={{ width: 160, marginBottom: 14 }} />
      <Bone className="skeleton-section-title" />
      <div className="checkout-layout">
        <Bone className="skeleton-cover" />
        <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <Bone className="skeleton-line" />
          <Bone className="skeleton-line skeleton-line--mid" />
          <Bone className="skeleton-line skeleton-line--sm" />
          <Bone className="skeleton-input" />
          <Bone className="skeleton-btn" />
        </div>
      </div>
    </div>
  );
}

export function AdminHomeSkeleton() {
  return (
    <div className="container page-shell" aria-busy="true" aria-label="A carregar administração">
      <Bone className="skeleton-line skeleton-line--title" style={{ marginBottom: 22 }} />
      <div className="admin-grid">
        {Array.from({ length: 4 }, (_, i) => <SkeletonAdminCard key={i} />)}
      </div>
    </div>
  );
}

export function AdminListSkeleton() {
  return (
    <div className="container page-shell" aria-busy="true" aria-label="A carregar">
      <Bone className="skeleton-line skeleton-line--title" style={{ marginBottom: 16 }} />
      <Bone className="skeleton-btn" style={{ marginBottom: 20 }} />
      {Array.from({ length: 5 }, (_, i) => <SkeletonListRow key={i} />)}
    </div>
  );
}

export function AdminFormSkeleton() {
  return (
    <div className="container page-shell" aria-busy="true" aria-label="A carregar formulário">
      <SkeletonForm />
    </div>
  );
}
