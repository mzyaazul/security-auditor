import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // During local dev, forward /api calls to `vercel dev` (default port 3000)
      // Run `vercel dev` in one terminal and `npm run dev` in another.
      "/api": "http://localhost:3000"
    }
  }
});
