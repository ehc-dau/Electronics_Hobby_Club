import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Where the website reads its content from (Firestore). Kept behind an alias so a
      // preview build can point it at sample data without touching the pages.
      "@site-source": path.resolve(__dirname, "./src/site/source.ts"),
    },
  },
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        // Firebase in its own file: it changes rarely, so browsers keep it cached between releases.
        manualChunks: { firebase: ["firebase/app", "firebase/firestore/lite"] },
      },
    },
  },
}));
