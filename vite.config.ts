import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: "./src",
  base: "./",
  publicDir: path.resolve(__dirname, "public"), // explicitly set public dir
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "./src/index.html"),
        splash: path.resolve(__dirname, "./src/splash.html"),
      },
    },
    outDir: "../dist",
    emptyOutDir: true,
  },
});
