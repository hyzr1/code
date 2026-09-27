import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Match production rewrites when developing or previewing the two HTML entries.
const courseRoute =
  /^\/(?:courses|problems|practice|concepts|typing)(?:\/|$)|^\/progress\/?$/;
const courseEntry = (
  req: { url?: string },
  _res: unknown,
  next: () => void,
) => {
  if (req && courseRoute.test((req.url ?? "").split("?")[0]))
    req.url = "/app/index.html";
  if (next) next();
};

export default defineConfig({
  plugins: [
    {
      name: "course-html-entry",
      configureServer: (server) => {
        server.middlewares.use(courseEntry);
      },
      configurePreviewServer: (server) => {
        server.middlewares.use(courseEntry);
      },
    },
    react(),
  ],
  build: {
    rollupOptions: {
      input: {
        home: "index.html",
        app: "app/index.html",
        frontpage: "frontpage/index.html",
      },
    },
    manifest: true,
    // Large curricula and coding runtimes are loaded behind route boundaries.
    // The budget check guards the small startup shell independently.
    chunkSizeWarningLimit: 6_500,
  },
  server: {
    // Listen on the LAN as well as localhost so the real mobile layout can be
    // tested on a phone connected to the same Wi-Fi.
    host: "0.0.0.0",
    port: 5192,
    strictPort: true,
    // Build checks and browser diagnostics live here. They can contain locked
    // browser database files, and none of them are application source.
    watch: {
      ignored: [
        "**/.check/**",
        "**/.voice-pack-cache/**",
        "**/public/voice-packs/**",
      ],
    },
  },
  worker: { format: "es" },
});
