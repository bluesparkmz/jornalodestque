"use client";

import Link from "next/link";
import { useState } from "react";
import type { Article } from "../lib/api";
import { mediaUrl } from "../lib/api";
import { articleHref, authorName, categoryName, formatDate, placeholderCover } from "../lib/format";

export function SectionTitle({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    <div className="section-title">
      <h2 className="section-title__text">{title}</h2>
      {actions ? <div className="section-title__actions">{actions}</div> : null}
    </div>
  );
}

export function CategoryBadge({ label, className = "" }: { label: string; className?: string }) {
  return <span className={`cat-badge ${className}`.trim()}>{label}</span>;
}

export function ArticleMeta({
  author,
  date,
  light = false,
  className = "",
}: {
  author: string;
  date?: string | null;
  light?: boolean;
  className?: string;
}) {
  return (
    <p className={`article-meta${light ? " is-light" : ""} ${className}`.trim()}>
      <span className="article-meta__by">Por {author}</span>
      {date ? <span className="article-meta__date">{formatDate(date)}</span> : null}
    </p>
  );
}

function CoverImage({ article, alt = "" }: { article: Article; alt?: string }) {
  const [failed, setFailed] = useState(false);
  const src = !failed && article.featured_image_url ? mediaUrl(article.featured_image_url) : placeholderCover(article.id || article.slug);
  return <img src={src ?? placeholderCover(article.slug)} alt={alt || article.title} onError={() => setFailed(true)} />;
}

export function FeatureCard({ article, size = "lg" }: { article: Article; size?: "lg" | "md" | "sm" }) {
  return (
    <article className={`feature-card feature-card--${size}`}>
      <Link href={articleHref(article.slug)} className="feature-card__media">
        <CoverImage article={article} />
        <span className="feature-card__shade" />
      </Link>
      <div className="feature-card__body">
        <CategoryBadge label={categoryName(article)} />
        <h3 className="feature-card__title">
          <Link href={articleHref(article.slug)}>{article.title}</Link>
        </h3>
        <ArticleMeta author={authorName(article)} date={article.published_at} light />
      </div>
    </article>
  );
}

export function ThumbPost({ article }: { article: Article }) {
  return (
    <article className="thumb-post">
      <Link href={articleHref(article.slug)} className="thumb-post__media">
        <CoverImage article={article} />
      </Link>
      <div className="thumb-post__body">
        <ArticleMeta author={authorName(article)} date={article.published_at} />
        <h3 className="thumb-post__title">
          <Link href={articleHref(article.slug)}>{article.title}</Link>
        </h3>
      </div>
    </article>
  );
}

export function GridPost({ article }: { article: Article }) {
  return (
    <article className="grid-post">
      <Link href={articleHref(article.slug)} className="grid-post__media">
        <CoverImage article={article} />
      </Link>
      <ArticleMeta author={authorName(article)} date={article.published_at} />
      <h3 className="grid-post__title">
        <Link href={articleHref(article.slug)}>{article.title}</Link>
      </h3>
    </article>
  );
}

export function StackPost({ article }: { article: Article }) {
  return (
    <article className="stack-post">
      <Link href={articleHref(article.slug)} className="stack-post__media">
        <CoverImage article={article} />
      </Link>
      <div className="stack-post__body">
        <CategoryBadge label={categoryName(article)} />
        <ArticleMeta author={authorName(article)} date={article.published_at} />
        <h3 className="stack-post__title">
          <Link href={articleHref(article.slug)}>{article.title}</Link>
        </h3>
        {article.excerpt ? <p className="stack-post__excerpt">{article.excerpt}</p> : null}
      </div>
    </article>
  );
}

export function PopularItem({ article, index }: { article: Article; index: number }) {
  return (
    <article className="popular-item">
      <span className="popular-item__num">{index}</span>
      <div className="popular-item__body">
        <CategoryBadge label={categoryName(article)} />
        <h3 className="popular-item__title">
          <Link href={articleHref(article.slug)}>{article.title}</Link>
        </h3>
      </div>
    </article>
  );
}

export function SliderButtons() {
  return (
    <div className="slider-btns" aria-hidden="true">
      <button type="button" className="slider-btn" tabIndex={-1}>‹</button>
      <button type="button" className="slider-btn" tabIndex={-1}>›</button>
    </div>
  );
}
