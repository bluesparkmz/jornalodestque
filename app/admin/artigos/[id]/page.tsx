"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function Redirect() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  useEffect(() => { router.replace(`/dashboard/noticias/${id}`); }, [router, id]);
  return null;
}
