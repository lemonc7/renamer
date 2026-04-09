import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), svelte()],
  resolve: {
    alias: {
      $lib: path.resolve("./src/lib"),
      src: path.resolve("./src")
    }
  },
  server: {
    host: "0.0.0.0",
    proxy: {
      // 匹配所有以 /api 开头的请求
      "/api": {
        target: "http://127.0.0.1:7777",
        changeOrigin: true
      }
    }
  }
})
