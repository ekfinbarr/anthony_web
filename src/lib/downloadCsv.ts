/**
 * Download a CSV (or other binary) response from an authenticated API endpoint.
 */
export async function downloadAuthenticatedFile(
  endpoint: string,
  fallbackFilename: string,
  params?: Record<string, string | number | boolean | null | undefined>
): Promise<void> {
  const query = params
    ? "?" +
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&")
    : "";

  const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api").replace(/\/$/, "");
  const url = `${base}/${endpoint.replace(/^\//, "")}${query}`;

  const token = (() => {
    try {
      const userRaw = localStorage.getItem("church_user");
      if (!userRaw) return null;
      const parsed = JSON.parse(userRaw) as { token?: string };
      return parsed.token || null;
    } catch {
      return null;
    }
  })();

  const res = await fetch(url, {
    headers: {
      Accept: "text/csv,application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    let message = `Download failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = /filename="?([^"]+)"?/i.exec(disposition);
  const filename = match?.[1] || fallbackFilename;

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}
