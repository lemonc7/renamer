import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import ui from "@nuxt/ui/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), ui()],
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://127.0.0.1:7777",
        changeOrigin: true
      }
    }
  }
})
