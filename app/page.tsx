"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api, Article, Category } from "./lib/api";
import {
  FeatureCard,
  GridPost,
  PopularItem,
  SectionTitle,
  SliderButtons,
  StackPost,
  ThumbPost,
} from "./components/ui";
import { HomeSkeleton } from "./components/skeletons";

function take<T>(items: T[], start: number, count: number) {
  return items.slice(start, start + count);
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<{ items: Article[] }>("/articles?per_page=100"),
      api<Category[]>("/categories"),
    ])
      .then(([result, cats]) => {
        setArticles(result.items);
        setCategories(cats);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  const byViews = useMemo(
    () => [...articles].sort((a, b) => (b.views_count ?? 0) - (a.views_count ?? 0)),
    [articles],
  );

  const trending = take(articles, 0, 3);
  const heroMain = articles[0];
  const heroSide = take(articles, 1, 2);
  const subfeatures = take(articles, 3, 4);
  const recentFeatured = take(articles, 5, 2);
  const recentGrid = useMemo(() => {
    const seen = new Set<number>();
    return articles.filter((article) => {
      if (seen.has(article.id)) return false;
      seen.add(article.id);
      return true;
    });
  }, [articles]);
  const popular = take(byViews, 0, 4);
  const sports = take(articles, 11, 4);
  const lifestyleMain = articles[15];
  const lifestyleSide = take(articles, 16, 3);
  const latest = take(articles, 19, 4);
  const tech = take(articles, 20, 4);

  const sportsTitle = categories.find((c) => /sport|desporto|desporto/i.test(c.name))?.name ?? "Desporto";
  const lifestyleTitle = categories.find((c) => /life|estilo|lifestyle/i.test(c.name))?.name ?? "Estilo de vida";
  const techTitle = categories.find((c) => /tech|tecnolog/i.test(c.name))?.name ?? "Tecnologia";

  if (loading) return <HomeSkeleton />;

  if (error) {
    return (
      <div className="container home-page">
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!articles.length) {
    return (
      <div className="container home-page">
        <div className="empty-state">Ainda não há notícias publicadas.</div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="container">
        {trending.length > 0 && (
          <section className="trending-row" aria-label="Destaques rápidos">
            {trending.map((article) => (
              <ThumbPost key={`trend-${article.id}`} article={article} />
            ))}
          </section>
        )}

        {heroMain && (
          <section className="hero-grid" aria-label="Destaque principal">
            <FeatureCard article={heroMain} size="lg" />
            <div className="hero-side">
              {heroSide.map((article) => (
                <FeatureCard key={article.id} article={article} size="sm" />
              ))}
            </div>
          </section>
        )}

        {subfeatures.length > 0 && (
          <section className="subfeature-row" aria-label="Mais notícias">
            {subfeatures.map((article) => (
              <GridPost key={`sub-${article.id}`} article={article} />
            ))}
          </section>
        )}

        <section className="content-split">
          <div>
            <SectionTitle title="Posts recentes" />
            {recentFeatured.length > 0 && (
              <div className="recent-featured">
                {recentFeatured.map((article) => (
                  <FeatureCard key={`rf-${article.id}`} article={article} size="md" />
                ))}
              </div>
            )}
            {recentGrid.length > 0 && (
              <div className="recent-grid">
                {recentGrid.map((article) => (
                  <GridPost key={`rg-${article.id}`} article={article} />
                ))}
              </div>
            )}
          </div>

          <aside>
            <div className="popular-box">
              <SectionTitle title="Populares" />
              {popular.map((article, index) => (
                <PopularItem key={`pop-${article.id}`} article={article} index={index + 1} />
              ))}
              <div className="popular-nav">
                <SliderButtons />
              </div>
            </div>
          </aside>
        </section>

        {sports.length > 0 && (
          <section className="category-band">
            <SectionTitle title={sportsTitle} actions={<SliderButtons />} />
            <div className="category-grid-4">
              {sports.map((article) => (
                <GridPost key={`sp-${article.id}`} article={article} />
              ))}
            </div>
          </section>
        )}

        <section className="lifestyle-split">
          <div>
            <SectionTitle title={lifestyleTitle} />
            <div className="lifestyle-grid">
              {lifestyleMain && <StackPost article={lifestyleMain} />}
              <div className="lifestyle-side">
                {lifestyleSide.map((article) => (
                  <ThumbPost key={`ls-${article.id}`} article={article} />
                ))}
              </div>
            </div>
          </div>
          <aside>
            <SectionTitle title="Últimos posts" />
            <div className="lifestyle-side">
              {latest.map((article) => (
                <ThumbPost key={`lp-${article.id}`} article={article} />
              ))}
            </div>
          </aside>
        </section>

        {tech.length > 0 && (
          <section className="category-band">
            <SectionTitle title={techTitle} />
            <div className="tech-grid">
              {tech.map((article) => (
                <StackPost key={`tech-${article.id}`} article={article} />
              ))}
            </div>
          </section>
        )}

        <section className="widgets-row">
          <div className="widget-card">
            <h3>Mantenha-se ligado</h3>
            <div className="social-stats">
              <div className="social-stat"><strong>19,243</strong><span>fãs · Facebook</span></div>
              <div className="social-stat"><strong>2.076</strong><span>seguidores · Twitter</span></div>
              <div className="social-stat"><strong>15,200</strong><span>inscritos · YouTube</span></div>
            </div>
          </div>

          <div className="widget-card">
            <h3>Tags</h3>
            <div className="tag-cloud">
              {(categories.length ? categories : [{ id: 1, name: "notícias", slug: "noticias", description: null }]).slice(0, 12).map((category) => (
                <Link key={category.id} href={`/categorias/${encodeURIComponent(category.slug)}`}>
                  #{category.name.toLowerCase()}
                </Link>
              ))}
            </div>
          </div>

          <div className="widget-card newsletter-box">
            <h3>Newsletter</h3>
            <p>As notícias e eventos mais importantes do dia, no seu email.</p>
            <form className="newsletter-form" onSubmit={(event) => event.preventDefault()}>
              <input type="email" placeholder="O seu email" aria-label="Email para newsletter" />
              <button type="submit">Subscrever</button>
            </form>
          </div>
        </section>

        <nav className="pagination" aria-label="Paginação">
          <span>«</span>
          <span>1</span>
          <span className="is-active">2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>»</span>
        </nav>
      </div>
    </div>
  );
}
