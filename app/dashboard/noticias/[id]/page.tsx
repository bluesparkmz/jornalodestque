"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { marked } from "marked";
import { api, Article } from "../../../lib/api";
import { useSession } from "../../../components/session";
import { ArticleWorkspace } from "../../../components/article-workspace";
import { AdminFormSkeleton } from "../../../components/skeletons";

function EditNoticia() {
  const { id } = useParams<{ id: string }>();
  const { token } = useSession();
  const [item, setItem] = useState<Article | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api<Article>(`/articles/admin/${id}`, {}, token)
      .then(setItem)
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return <AdminFormSkeleton />;
  if (error) return <p className="error" style={{ padding: 24 }}>{error}</p>;
  if (!item || !token) return null;

  const content =
    item.content_format === "markdown"
      ? (marked.parse(item.content, { async: false }) as string)
      : item.content;

  return (
    <ArticleWorkspace
      token={token}
      mode="edit"
      initial={{
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        content,
        featured_image_url: item.featured_image_url,
        status: item.status,
        category_ids: item.categories?.map((category) => category.id) ?? [],
        slug: item.slug,
      }}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<AdminFormSkeleton />}>
      <EditNoticia />
    </Suspense>
  );
}
