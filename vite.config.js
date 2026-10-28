import { defineConfig } from "vite";

// In production the game lives at coopnkieran.com/fish4fish/. Locally it stays at the root,
// so `npm run dev` still opens at http://localhost:5173/ and your saved game is untouched.
// The build goes into dist/fish4fish so the files sit at the same path they're served from.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/fish4fish/" : "/",
  build: { outDir: "dist/fish4fish" },
}));
