"use client";

import { useSession } from "../../../components/session";
import { ArticleWorkspace } from "../../../components/article-workspace";

export default function NovaNoticia() {
  const { token } = useSession();
  if (!token) return null;
  return <ArticleWorkspace token={token} mode="create" />;
}
