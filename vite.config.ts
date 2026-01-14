import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Allow configuring the backend target in dev without hardcoding it.
  // - VITE_API_PROXY_TARGET should be the Laravel origin (NO /api suffix), e.g. http://localhost:8000
  // - If not set, we fall back to localhost:8000 (matches default API_BASE_URL in apiClient).
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://localhost:8000";

  return {
    server: {
      host: "::",
      port: 8080,
      // In dev, proxy /api/* to Laravel so the frontend never accidentally hits Vite for API routes.
      // This also avoids CORS pain when using relative API base URLs like "/api".
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
