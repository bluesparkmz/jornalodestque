import axios, { AxiosRequestConfig } from "axios";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
const client = axios.create({ baseURL: API_URL, timeout: 30_000 });
export type User = { id: number; username: string; email: string | null; display_name: string | null; role: string; is_active: boolean };
export type Category = { id: number; name: string; slug: string; description: string | null };
export type Article = { id: number; title: string; slug: string; excerpt: string | null; content: string; content_format: "markdown" | "html"; status: string; views_count: number; featured_image_url: string | null; published_at: string | null; author: { display_name: string | null; username: string } | null; categories?: Category[] };
export function mediaUrl(url: string | null) { return url ? (url.startsWith("http") ? url : `${API_URL}${url}`) : null; }
type ApiOptions = RequestInit & { onUploadProgress?: (percent: number) => void };

function friendlyError(status?: number): string {
  if (status === 401) return "Inicie sessão para continuar.";
  if (status === 403) return "Não tem permissão para esta ação.";
  if (status === 404) return "O conteúdo pedido não foi encontrado.";
  if (status === 409) return "Já existe um registo com estes dados.";
  if (status === 413) return "O ficheiro seleccionado é demasiado grande.";
  if (status === 415 || status === 422) return "Verifique os dados ou escolha um ficheiro válido.";
  return "Não foi possível concluir a ação agora. Tente novamente.";
}

export async function api<T>(path: string, options: ApiOptions = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  const config: AxiosRequestConfig = {
    url: path, method: options.method ?? "GET", data: options.body, headers,
    onUploadProgress: options.onUploadProgress ? (event) => {
      if (event.total) options.onUploadProgress!(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    } : undefined,
  };
  try { return (await client.request<T>(config)).data; }
  catch (error) { throw new Error(friendlyError(axios.isAxiosError(error) ? error.response?.status : undefined)); }
}
