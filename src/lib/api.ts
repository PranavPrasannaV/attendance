export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

export const api = {
  get: async <T>(path: string, init?: RequestInit) =>
    handle<T>(await fetch(`${API_URL}${path}`, { ...init, cache: "no-store" })),
  post: async <T>(path: string, body: BodyInit, init?: RequestInit) =>
    handle<T>(
      await fetch(`${API_URL}${path}`, {
        method: "POST",
        body,
        ...init,
      })
    ),
  del: async <T>(path: string, init?: RequestInit) =>
    handle<T>(
      await fetch(`${API_URL}${path}`, {
        method: "DELETE",
        ...init,
      })
    ),
};
