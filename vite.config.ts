import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
