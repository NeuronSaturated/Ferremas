import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Aqui se configura Vite para desarrollo local y build de produccion.
export default defineConfig(({ mode }) => ({
  server: {
    // En esta parte el servidor local queda disponible en el puerto 8080.
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      // Aca las llamadas /api del frontend local se envian al backend Express.
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  // Aqui se activan React/SWC y, solo en desarrollo, el tagger visual de Lovable.
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      // En esta parte "@" apunta a src para imports mas limpios.
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
