import { createApp } from "vue"
import App from "./App.vue"
import * as ElementPlusIconsVue from "@element-plus/icons-vue"
import { createPinia } from "pinia"
import router from "./router"

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(router)
app.mount("#app")
