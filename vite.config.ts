import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
// Use "/" so dev server and default preview resolve scripts reliably. For static hosting in a subpath, set VITE_BASE.
export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  server: {
    open: true,
    host: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
