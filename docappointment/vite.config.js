import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import removeConsole from "vite-plugin-remove-console";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    removeConsole({ include: ["log", "warn", "error", "info", "alert"] }),
    react(),
  ],
});
